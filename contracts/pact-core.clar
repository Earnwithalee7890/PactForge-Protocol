;; PactForge Core - Trustless Escrow Protocol
;; Manages creation, funding, completion, and cancellation of escrow pacts
;; Deployed on Stacks Mainnet: SP2F500B8DTRK1EANJQ054BRAB8DDKN6QCMXGNFBT.pactcore

;; ===== Constants =====
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u200))
(define-constant err-not-authorized (err u201))
(define-constant err-pact-not-found (err u202))
(define-constant err-invalid-state (err u203))
(define-constant err-insufficient-funds (err u204))
(define-constant err-invalid-amount (err u205))
(define-constant err-already-funded (err u206))
(define-constant err-deadline-passed (err u207))
(define-constant err-deadline-not-passed (err u208))
(define-constant err-self-pact (err u209))

;; Pact States
(define-constant STATE-CREATED u0)
(define-constant STATE-FUNDED u1)
(define-constant STATE-ACTIVE u2)
(define-constant STATE-COMPLETED u3)
(define-constant STATE-DISPUTED u4)
(define-constant STATE-CANCELLED u5)
(define-constant STATE-REFUNDED u6)

;; Protocol fee: 1% (100 basis points)
(define-constant PROTOCOL-FEE-BPS u100)
(define-constant BPS-DENOMINATOR u10000)

;; ===== Data Variables =====
(define-data-var pact-counter uint u0)
(define-data-var protocol-treasury principal contract-owner)
(define-data-var total-volume uint u0)
(define-data-var total-pacts-created uint u0)
(define-data-var total-pacts-completed uint u0)

;; ===== Data Maps =====
(define-map pacts
  { pact-id: uint }
  {
    client: principal,
    provider: principal,
    total-amount: uint,
    funded-amount: uint,
    released-amount: uint,
    state: uint,
    title: (string-utf8 128),
    description: (string-utf8 512),
    created-at: uint,
    deadline: uint,
    milestone-count: uint
  }
)

(define-map pact-participants
  { pact-id: uint, participant: principal }
  { role: (string-ascii 16) }
)

;; ===== Public Functions =====

;; Create a new escrow pact
(define-public (create-pact 
    (provider principal)
    (total-amount uint)
    (title (string-utf8 128))
    (description (string-utf8 512))
    (deadline uint)
    (milestone-count uint))
  (let
    (
      (pact-id (+ (var-get pact-counter) u1))
    )
    (asserts! (> total-amount u0) err-invalid-amount)
    (asserts! (not (is-eq tx-sender provider)) err-self-pact)
    (asserts! (> deadline stacks-block-height) err-deadline-passed)
    (asserts! (> milestone-count u0) err-invalid-amount)

    ;; Create the pact
    (map-set pacts
      { pact-id: pact-id }
      {
        client: tx-sender,
        provider: provider,
        total-amount: total-amount,
        funded-amount: u0,
        released-amount: u0,
        state: STATE-CREATED,
        title: title,
        description: description,
        created-at: stacks-block-height,
        deadline: deadline,
        milestone-count: milestone-count
      }
    )

    ;; Register participants
    (map-set pact-participants
      { pact-id: pact-id, participant: tx-sender }
      { role: "client" }
    )
    (map-set pact-participants
      { pact-id: pact-id, participant: provider }
      { role: "provider" }
    )

    ;; Update counters
    (var-set pact-counter pact-id)
    (var-set total-pacts-created (+ (var-get total-pacts-created) u1))

    (print { event: "pact-created", pact-id: pact-id, client: tx-sender, provider: provider, amount: total-amount })
    (ok pact-id)
  )
)

;; Fund a pact (client deposits STX into contract)
(define-public (fund-pact (pact-id uint))
  (let
    (
      (pact (unwrap! (map-get? pacts { pact-id: pact-id }) err-pact-not-found))
      (amount (get total-amount pact))
    )
    (asserts! (is-eq tx-sender (get client pact)) err-not-authorized)
    (asserts! (is-eq (get state pact) STATE-CREATED) err-invalid-state)

    ;; Transfer STX to contract using current-contract
    (try! (stx-transfer? amount tx-sender current-contract))

    ;; Update pact state
    (map-set pacts
      { pact-id: pact-id }
      (merge pact {
        funded-amount: amount,
        state: STATE-FUNDED
      })
    )

    ;; Update total volume
    (var-set total-volume (+ (var-get total-volume) amount))

    (print { event: "pact-funded", pact-id: pact-id, amount: amount })
    (ok true)
  )
)

;; Accept a funded pact (provider confirms)
(define-public (accept-pact (pact-id uint))
  (let
    (
      (pact (unwrap! (map-get? pacts { pact-id: pact-id }) err-pact-not-found))
    )
    (asserts! (is-eq tx-sender (get provider pact)) err-not-authorized)
    (asserts! (is-eq (get state pact) STATE-FUNDED) err-invalid-state)

    (map-set pacts
      { pact-id: pact-id }
      (merge pact { state: STATE-ACTIVE })
    )

    (print { event: "pact-accepted", pact-id: pact-id, provider: tx-sender })
    (ok true)
  )
)

;; Release milestone payment (client approves)
(define-public (release-payment (pact-id uint) (amount uint))
  (let
    (
      (pact (unwrap! (map-get? pacts { pact-id: pact-id }) err-pact-not-found))
      (fee (/ (* amount PROTOCOL-FEE-BPS) BPS-DENOMINATOR))
      (net-amount (- amount fee))
      (new-released (+ (get released-amount pact) amount))
      (treasury (var-get protocol-treasury))
    )
    (asserts! (is-eq tx-sender (get client pact)) err-not-authorized)
    (asserts! (is-eq (get state pact) STATE-ACTIVE) err-invalid-state)
    (asserts! (<= new-released (get funded-amount pact)) err-insufficient-funds)

    ;; Transfer net amount to provider (from contract)
    (try! (as-contract? ((with-stx net-amount)) (unwrap-panic (stx-transfer? net-amount tx-sender (get provider pact)))))

    ;; Transfer fee to treasury
    (if (> fee u0)
      (try! (as-contract? ((with-stx fee)) (unwrap-panic (stx-transfer? fee tx-sender treasury))))
      true
    )

    ;; Update pact
    (let
      (
        (is-complete (is-eq new-released (get funded-amount pact)))
        (new-state (if is-complete STATE-COMPLETED STATE-ACTIVE))
      )
      (map-set pacts
        { pact-id: pact-id }
        (merge pact {
          released-amount: new-released,
          state: new-state
        })
      )

      (if is-complete
        (var-set total-pacts-completed (+ (var-get total-pacts-completed) u1))
        true
      )
    )

    (print { event: "payment-released", pact-id: pact-id, amount: amount, fee: fee })
    (ok true)
  )
)

;; Cancel pact and refund
(define-public (cancel-pact (pact-id uint))
  (let
    (
      (pact (unwrap! (map-get? pacts { pact-id: pact-id }) err-pact-not-found))
      (refund-amount (- (get funded-amount pact) (get released-amount pact)))
    )
    (asserts! (is-eq tx-sender (get client pact)) err-not-authorized)
    (asserts! (or 
      (is-eq (get state pact) STATE-CREATED)
      (is-eq (get state pact) STATE-FUNDED)
      (and (is-eq (get state pact) STATE-ACTIVE) (> stacks-block-height (get deadline pact)))
    ) err-invalid-state)

    ;; Refund remaining funds
    (if (> refund-amount u0)
      (try! (as-contract? ((with-stx refund-amount)) (unwrap-panic (stx-transfer? refund-amount tx-sender (get client pact)))))
      true
    )

    (map-set pacts
      { pact-id: pact-id }
      (merge pact { state: STATE-CANCELLED })
    )

    (print { event: "pact-cancelled", pact-id: pact-id, refund: refund-amount })
    (ok true)
  )
)

;; Raise dispute
(define-public (raise-dispute (pact-id uint))
  (let
    (
      (pact (unwrap! (map-get? pacts { pact-id: pact-id }) err-pact-not-found))
    )
    (asserts! (or 
      (is-eq tx-sender (get client pact))
      (is-eq tx-sender (get provider pact))
    ) err-not-authorized)
    (asserts! (is-eq (get state pact) STATE-ACTIVE) err-invalid-state)

    (map-set pacts
      { pact-id: pact-id }
      (merge pact { state: STATE-DISPUTED })
    )

    (print { event: "dispute-raised", pact-id: pact-id, raised-by: tx-sender })
    (ok true)
  )
)

;; ===== Read-Only Functions =====

(define-read-only (get-pact (pact-id uint))
  (map-get? pacts { pact-id: pact-id })
)

(define-read-only (get-pact-count)
  (var-get pact-counter)
)

(define-read-only (get-participant-role (pact-id uint) (participant principal))
  (map-get? pact-participants { pact-id: pact-id, participant: participant })
)

(define-read-only (get-protocol-stats)
  {
    total-pacts: (var-get total-pacts-created),
    completed-pacts: (var-get total-pacts-completed),
    total-volume: (var-get total-volume)
  }
)

(define-read-only (calculate-fee (amount uint))
  (/ (* amount PROTOCOL-FEE-BPS) BPS-DENOMINATOR)
)

;; ===== Admin Functions =====

(define-public (set-treasury (new-treasury principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (var-set protocol-treasury new-treasury)
    (ok true)
  )
)
