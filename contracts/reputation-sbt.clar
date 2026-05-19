;; Reputation SBT - Soul-Bound Reputation Tokens for PactForge
;; Non-transferable reputation tracking for protocol participants
;; Deployed on Stacks Mainnet: SP2F500B8DTRK1EANJQ054BRAB8DDKN6QCMXGNFBT.reputation-sbt-v2

(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u500))
(define-constant err-not-authorized (err u501))
(define-constant err-no-reputation (err u502))

(define-constant SCORE-PACT-COMPLETED u10)
(define-constant SCORE-MILESTONE-DELIVERED u5)
(define-constant SCORE-DISPUTE-WON u3)
(define-constant SCORE-DISPUTE-LOST u5)
(define-constant SCORE-ARBITER-RESOLVED u2)

(define-data-var total-participants uint u0)

(define-map reputation { user: principal }
  { score: uint, pacts-completed: uint, milestones-delivered: uint,
    disputes-won: uint, disputes-lost: uint, joined-at: uint })

(define-map reputation-log { user: principal, index: uint }
  { action: (string-ascii 32), points: uint, block: uint })

(define-map user-log-count { user: principal } { count: uint })

;; Initialize reputation for a new user
(define-public (init-reputation)
  (begin
    (asserts! (is-none (map-get? reputation { user: tx-sender })) (err u510))
    (map-set reputation { user: tx-sender }
      { score: u0, pacts-completed: u0, milestones-delivered: u0,
        disputes-won: u0, disputes-lost: u0, joined-at: stacks-block-height })
    (map-set user-log-count { user: tx-sender } { count: u0 })
    (var-set total-participants (+ (var-get total-participants) u1))
    (print { event: "reputation-initialized", user: tx-sender })
    (ok true)))

;; Add reputation score (called by protocol contracts)
(define-public (add-reputation (user principal) (points uint) (action (string-ascii 32)))
  (let ((rep (unwrap! (map-get? reputation { user: user }) err-no-reputation))
        (log-count (default-to { count: u0 } (map-get? user-log-count { user: user })))
        (new-index (+ (get count log-count) u1)))
    (map-set reputation { user: user }
      (merge rep { score: (+ (get score rep) points) }))
    (map-set reputation-log { user: user, index: new-index }
      { action: action, points: points, block: stacks-block-height })
    (map-set user-log-count { user: user } { count: new-index })
    (print { event: "reputation-added", user: user, points: points, action: action })
    (ok true)))

;; Record pact completion
(define-public (record-pact-completed (user principal))
  (let ((rep (unwrap! (map-get? reputation { user: user }) err-no-reputation)))
    (map-set reputation { user: user }
      (merge rep { score: (+ (get score rep) SCORE-PACT-COMPLETED),
                   pacts-completed: (+ (get pacts-completed rep) u1) }))
    (ok true)))

;; Record milestone delivery
(define-public (record-milestone-delivered (user principal))
  (let ((rep (unwrap! (map-get? reputation { user: user }) err-no-reputation)))
    (map-set reputation { user: user }
      (merge rep { score: (+ (get score rep) SCORE-MILESTONE-DELIVERED),
                   milestones-delivered: (+ (get milestones-delivered rep) u1) }))
    (ok true)))

;; Record dispute loss (subtract from score)
(define-public (record-dispute-lost (user principal))
  (let ((rep (unwrap! (map-get? reputation { user: user }) err-no-reputation))
        (current-score (get score rep))
        (new-score (if (>= current-score SCORE-DISPUTE-LOST)
                      (- current-score SCORE-DISPUTE-LOST)
                      u0)))
    (map-set reputation { user: user }
      (merge rep { score: new-score,
                   disputes-lost: (+ (get disputes-lost rep) u1) }))
    (ok true)))

(define-read-only (get-reputation (user principal))
  (map-get? reputation { user: user }))

(define-read-only (get-reputation-score (user principal))
  (match (map-get? reputation { user: user })
    rep (ok (get score rep)) (err u502)))

(define-read-only (get-total-participants) (var-get total-participants))

(define-read-only (get-reputation-tier (user principal))
  (match (map-get? reputation { user: user })
    rep (let ((score (get score rep)))
          (if (>= score u100) (ok u4)      ;; Diamond
            (if (>= score u50) (ok u3)     ;; Gold
              (if (>= score u20) (ok u2)   ;; Silver
                (ok u1)))))                 ;; Bronze
    (ok u0)))                              ;; Unranked
