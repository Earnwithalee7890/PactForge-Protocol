;; Milestone Engine - Manages milestone-based payment workflows
;; Deployed on Stacks Mainnet: SP2F500B8DTRK1EANJQ054BRAB8DDKN6QCMXGNFBT.milestone-v2

(define-constant err-not-authorized (err u301))
(define-constant err-milestone-not-found (err u302))
(define-constant err-invalid-state (err u303))
(define-constant err-invalid-amount (err u304))
(define-constant err-milestone-limit (err u306))

(define-constant MS-PENDING u0)
(define-constant MS-IN-PROGRESS u1)
(define-constant MS-SUBMITTED u2)
(define-constant MS-APPROVED u3)
(define-constant MS-REJECTED u4)
(define-constant MS-PAID u5)
(define-constant MAX-MILESTONES u10)

(define-data-var milestone-counter uint u0)

(define-map milestones
  { milestone-id: uint }
  {
    pact-id: uint, index: uint,
    title: (string-utf8 128), description: (string-utf8 512),
    amount: uint, state: uint,
    created-at: uint, submitted-at: uint, completed-at: uint,
    deliverable-hash: (optional (buff 32))
  }
)

(define-map pact-milestones { pact-id: uint, index: uint } { milestone-id: uint })
(define-map pact-milestone-count { pact-id: uint } { count: uint })

(define-public (add-milestone (pact-id uint) (title (string-utf8 128)) (description (string-utf8 512)) (amount uint))
  (let ((ms-id (+ (var-get milestone-counter) u1))
        (current-count (default-to { count: u0 } (map-get? pact-milestone-count { pact-id: pact-id })))
        (new-index (+ (get count current-count) u1)))
    (asserts! (> amount u0) err-invalid-amount)
    (asserts! (<= new-index MAX-MILESTONES) err-milestone-limit)
    (map-set milestones { milestone-id: ms-id }
      { pact-id: pact-id, index: new-index, title: title, description: description,
        amount: amount, state: MS-PENDING, created-at: stacks-block-height,
        submitted-at: u0, completed-at: u0, deliverable-hash: none })
    (map-set pact-milestones { pact-id: pact-id, index: new-index } { milestone-id: ms-id })
    (map-set pact-milestone-count { pact-id: pact-id } { count: new-index })
    (var-set milestone-counter ms-id)
    (print { event: "milestone-added", milestone-id: ms-id, pact-id: pact-id })
    (ok ms-id)))

(define-public (start-milestone (milestone-id uint))
  (let ((ms (unwrap! (map-get? milestones { milestone-id: milestone-id }) err-milestone-not-found)))
    (asserts! (is-eq (get state ms) MS-PENDING) err-invalid-state)
    (map-set milestones { milestone-id: milestone-id } (merge ms { state: MS-IN-PROGRESS }))
    (ok true)))

(define-public (submit-milestone (milestone-id uint) (deliverable-hash (buff 32)))
  (let ((ms (unwrap! (map-get? milestones { milestone-id: milestone-id }) err-milestone-not-found)))
    (asserts! (or (is-eq (get state ms) MS-IN-PROGRESS) (is-eq (get state ms) MS-REJECTED)) err-invalid-state)
    (map-set milestones { milestone-id: milestone-id }
      (merge ms { state: MS-SUBMITTED, submitted-at: stacks-block-height, deliverable-hash: (some deliverable-hash) }))
    (ok true)))

(define-public (approve-milestone (milestone-id uint))
  (let ((ms (unwrap! (map-get? milestones { milestone-id: milestone-id }) err-milestone-not-found)))
    (asserts! (is-eq (get state ms) MS-SUBMITTED) err-invalid-state)
    (map-set milestones { milestone-id: milestone-id }
      (merge ms { state: MS-APPROVED, completed-at: stacks-block-height }))
    (ok true)))

(define-public (reject-milestone (milestone-id uint))
  (let ((ms (unwrap! (map-get? milestones { milestone-id: milestone-id }) err-milestone-not-found)))
    (asserts! (is-eq (get state ms) MS-SUBMITTED) err-invalid-state)
    (map-set milestones { milestone-id: milestone-id } (merge ms { state: MS-REJECTED }))
    (ok true)))

(define-public (mark-paid (milestone-id uint))
  (let ((ms (unwrap! (map-get? milestones { milestone-id: milestone-id }) err-milestone-not-found)))
    (asserts! (is-eq (get state ms) MS-APPROVED) err-invalid-state)
    (map-set milestones { milestone-id: milestone-id } (merge ms { state: MS-PAID }))
    (ok true)))

(define-read-only (get-milestone (milestone-id uint))
  (map-get? milestones { milestone-id: milestone-id }))

(define-read-only (get-pact-milestone (pact-id uint) (index uint))
  (match (map-get? pact-milestones { pact-id: pact-id, index: index })
    ms-link (map-get? milestones { milestone-id: (get milestone-id ms-link) }) none))

(define-read-only (get-pact-milestone-count (pact-id uint))
  (default-to { count: u0 } (map-get? pact-milestone-count { pact-id: pact-id })))
