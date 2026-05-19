;; Arbiter DAO - Decentralized dispute resolution with staked arbitrators
;; Deployed on Stacks Mainnet: SP2F500B8DTRK1EANJQ054BRAB8DDKN6QCMXGNFBT.arbiter-dao-v4

(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u400))
(define-constant err-not-authorized (err u401))
(define-constant err-dispute-not-found (err u402))
(define-constant err-invalid-state (err u403))
(define-constant err-already-voted (err u404))
(define-constant err-insufficient-stake (err u405))
(define-constant err-not-arbiter (err u406))

(define-constant DISPUTE-OPEN u0)
(define-constant DISPUTE-VOTING u1)
(define-constant DISPUTE-RESOLVED-CLIENT u2)
(define-constant DISPUTE-RESOLVED-PROVIDER u3)
(define-constant DISPUTE-RESOLVED-SPLIT u4)
(define-constant MIN-STAKE u1000000) ;; 1 STX minimum stake
(define-constant VOTES-REQUIRED u3)

(define-data-var dispute-counter uint u0)
(define-data-var arbiter-count uint u0)

(define-map arbiters { arbiter: principal }
  { stake: uint, disputes-resolved: uint, registered-at: uint, active: bool })

(define-map disputes { dispute-id: uint }
  { pact-id: uint, raised-by: principal, reason: (string-utf8 256),
    state: uint, votes-client: uint, votes-provider: uint,
    total-votes: uint, created-at: uint, resolved-at: uint })

(define-map dispute-votes { dispute-id: uint, arbiter: principal } { vote: uint })

;; Register as arbiter by staking STX
(define-public (register-arbiter)
  (let ((stake-amount MIN-STAKE))
    (try! (stx-transfer? stake-amount tx-sender current-contract))
    (map-set arbiters { arbiter: tx-sender }
      { stake: stake-amount, disputes-resolved: u0,
        registered-at: stacks-block-height, active: true })
    (var-set arbiter-count (+ (var-get arbiter-count) u1))
    (print { event: "arbiter-registered", arbiter: tx-sender, stake: stake-amount })
    (ok true)))

;; Create a dispute for a pact
(define-public (create-dispute (pact-id uint) (reason (string-utf8 256)))
  (let ((dispute-id (+ (var-get dispute-counter) u1)))
    (map-set disputes { dispute-id: dispute-id }
      { pact-id: pact-id, raised-by: tx-sender, reason: reason,
        state: DISPUTE-OPEN, votes-client: u0, votes-provider: u0,
        total-votes: u0, created-at: stacks-block-height, resolved-at: u0 })
    (var-set dispute-counter dispute-id)
    (print { event: "dispute-created", dispute-id: dispute-id, pact-id: pact-id })
    (ok dispute-id)))

;; Vote on a dispute (arbiter only)
(define-public (vote-dispute (dispute-id uint) (vote-for-client bool))
  (let ((dispute (unwrap! (map-get? disputes { dispute-id: dispute-id }) err-dispute-not-found))
        (arbiter (unwrap! (map-get? arbiters { arbiter: tx-sender }) err-not-arbiter)))
    (asserts! (get active arbiter) err-not-arbiter)
    (asserts! (or (is-eq (get state dispute) DISPUTE-OPEN)
                  (is-eq (get state dispute) DISPUTE-VOTING)) err-invalid-state)
    (asserts! (is-none (map-get? dispute-votes { dispute-id: dispute-id, arbiter: tx-sender })) err-already-voted)
    (map-set dispute-votes { dispute-id: dispute-id, arbiter: tx-sender }
      { vote: (if vote-for-client u1 u2) })
    (let ((new-client-votes (if vote-for-client (+ (get votes-client dispute) u1) (get votes-client dispute)))
          (new-provider-votes (if vote-for-client (get votes-provider dispute) (+ (get votes-provider dispute) u1)))
          (new-total (+ (get total-votes dispute) u1)))
      (let ((new-state (if (>= new-total VOTES-REQUIRED)
                          (if (> new-client-votes new-provider-votes) DISPUTE-RESOLVED-CLIENT
                            (if (> new-provider-votes new-client-votes) DISPUTE-RESOLVED-PROVIDER DISPUTE-RESOLVED-SPLIT))
                          DISPUTE-VOTING)))
        (map-set disputes { dispute-id: dispute-id }
          (merge dispute { votes-client: new-client-votes, votes-provider: new-provider-votes,
                          total-votes: new-total, state: new-state,
                          resolved-at: (if (>= new-total VOTES-REQUIRED) stacks-block-height u0) }))
        (if (>= new-total VOTES-REQUIRED)
          (map-set arbiters { arbiter: tx-sender }
            (merge arbiter { disputes-resolved: (+ (get disputes-resolved arbiter) u1) }))
          true)
        (print { event: "vote-cast", dispute-id: dispute-id, arbiter: tx-sender })
        (ok new-state)))))

(define-read-only (get-dispute (dispute-id uint))
  (map-get? disputes { dispute-id: dispute-id }))

(define-read-only (get-arbiter (who principal))
  (map-get? arbiters { arbiter: who }))

(define-read-only (get-dispute-count) (var-get dispute-counter))
(define-read-only (get-arbiter-count) (var-get arbiter-count))
