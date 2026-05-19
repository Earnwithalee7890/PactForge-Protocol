;; PactForge Token (PFG) - SIP-010 Compliant Fungible Token
;; A governance and utility token for the PactForge Protocol
;; Deployed on Stacks Mainnet: SP2F500B8DTRK1EANJQ054BRAB8DDKN6QCMXGNFBT.pactforge

(impl-trait 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE.sip-010-trait-ft-standard.sip-010-trait)

;; ===== Constants =====
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-token-owner (err u101))
(define-constant err-insufficient-balance (err u102))
(define-constant err-invalid-amount (err u103))

;; ===== Token Definition =====
(define-fungible-token pactforge-token u100000000000000) ;; 100M max supply (6 decimals)

;; ===== Data Variables =====
(define-data-var token-uri (optional (string-utf8 256)) (some u"https://pactforge.io/token/pfg.json"))
(define-data-var token-name (string-ascii 32) "PactForge Token")
(define-data-var token-symbol (string-ascii 10) "PFG")
(define-data-var token-decimals uint u6)
(define-data-var total-minted uint u0)

;; ===== SIP-010 Implementation =====

;; Transfer tokens
(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
  (begin
    (asserts! (> amount u0) err-invalid-amount)
    (asserts! (is-eq tx-sender sender) err-not-token-owner)
    (try! (ft-transfer? pactforge-token amount sender recipient))
    (match memo to-print (print to-print) 0x)
    (ok true)
  )
)

;; Get token name
(define-read-only (get-name)
  (ok (var-get token-name))
)

;; Get token symbol
(define-read-only (get-symbol)
  (ok (var-get token-symbol))
)

;; Get token decimals
(define-read-only (get-decimals)
  (ok (var-get token-decimals))
)

;; Get balance of principal
(define-read-only (get-balance (who principal))
  (ok (ft-get-balance pactforge-token who))
)

;; Get total supply
(define-read-only (get-total-supply)
  (ok (ft-get-supply pactforge-token))
)

;; Get token URI
(define-read-only (get-token-uri)
  (ok (var-get token-uri))
)

;; ===== Admin Functions =====

;; Mint tokens (owner only)
(define-public (mint (amount uint) (recipient principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (asserts! (> amount u0) err-invalid-amount)
    (try! (ft-mint? pactforge-token amount recipient))
    (var-set total-minted (+ (var-get total-minted) amount))
    (ok true)
  )
)

;; Burn tokens
(define-public (burn (amount uint) (sender principal))
  (begin
    (asserts! (is-eq tx-sender sender) err-not-token-owner)
    (asserts! (> amount u0) err-invalid-amount)
    (try! (ft-burn? pactforge-token amount sender))
    (ok true)
  )
)

;; Update token URI
(define-public (set-token-uri (new-uri (optional (string-utf8 256))))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (var-set token-uri new-uri)
    (ok true)
  )
)

;; ===== Read-Only Helpers =====
(define-read-only (get-total-minted)
  (var-get total-minted)
)
