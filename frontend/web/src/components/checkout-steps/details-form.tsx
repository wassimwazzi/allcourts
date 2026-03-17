"use client";

type DetailsFormProps = {
  name: string;
  phone: string;
  notes: string;
  onNameChange: (v: string) => void;
  onPhoneChange: (v: string) => void;
  onNotesChange: (v: string) => void;
  onBack: () => void;
  onNext: () => void;
};

export function DetailsForm({ name, phone, notes, onNameChange, onPhoneChange, onNotesChange, onBack, onNext }: DetailsFormProps) {
  const isValid = name.trim().length >= 2 && phone.trim().length >= 6;

  return (
    <div className="checkout-step">
      <h2 className="checkout-step-title">Your details</h2>
      <p className="checkout-step-subtitle">We&apos;ll use this for your booking confirmation.</p>

      <div className="checkout-fields">
        <label className="checkout-field">
          <span className="checkout-field-label">Full name <span aria-hidden="true">*</span></span>
          <input
            type="text"
            className="checkout-input"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Jamie Smith"
            autoComplete="name"
            required
          />
        </label>

        <label className="checkout-field">
          <span className="checkout-field-label">Phone <span aria-hidden="true">*</span></span>
          <input
            type="tel"
            className="checkout-input"
            value={phone}
            onChange={(e) => onPhoneChange(e.target.value)}
            placeholder="+1 555 000 0000"
            autoComplete="tel"
            required
          />
        </label>

        <label className="checkout-field">
          <span className="checkout-field-label">Notes <span className="checkout-field-optional">(optional)</span></span>
          <textarea
            className="checkout-input checkout-textarea"
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="Any special requests or information for the facility…"
            rows={3}
          />
        </label>
      </div>

      <div className="checkout-step-actions">
        <button type="button" className="button button-secondary" onClick={onBack}>
          Back
        </button>
        <button
          type="button"
          className="button button-primary"
          onClick={onNext}
          disabled={!isValid}
        >
          Continue to Payment
        </button>
      </div>
    </div>
  );
}
