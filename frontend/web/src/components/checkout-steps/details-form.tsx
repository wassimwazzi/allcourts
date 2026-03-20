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

const inputClass =
  "w-full rounded-xl border border-slate-700/25 bg-white/[0.04] px-4 py-3 text-base text-white placeholder:text-slate-500 outline-none transition focus:border-brand-accent/50 focus:shadow-[0_0_0_3px_rgb(var(--brand-accent)/0.08)]";

const fieldLabelClass = "mb-1.5 block text-sm font-semibold text-slate-300";

export function DetailsForm({ name, phone, notes, onNameChange, onPhoneChange, onNotesChange, onBack, onNext }: DetailsFormProps) {
  const isValid = name.trim().length >= 2 && phone.trim().length >= 6;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="mb-1 text-2xl font-extrabold text-white">Your details</h2>
        <p className="text-sm text-slate-400">We&apos;ll use this for your booking confirmation.</p>
      </div>

      <div className="flex flex-col gap-4">
        <label className="flex flex-col">
          <span className={fieldLabelClass}>
            Full name <span aria-hidden="true">*</span>
          </span>
          <input
            type="text"
            className={inputClass}
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Jamie Smith"
            autoComplete="name"
            required
          />
        </label>

        <label className="flex flex-col">
          <span className={fieldLabelClass}>
            Phone <span aria-hidden="true">*</span>
          </span>
          <input
            type="tel"
            className={inputClass}
            value={phone}
            onChange={(e) => onPhoneChange(e.target.value)}
            placeholder="+1 555 000 0000"
            autoComplete="tel"
            required
          />
        </label>

        <label className="flex flex-col">
          <span className={fieldLabelClass}>
            Notes{" "}
            <span className="ml-1 text-xs font-normal text-slate-500">(optional)</span>
          </span>
          <textarea
            className={inputClass}
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="Any special requests or information for the facility…"
            rows={3}
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className="inline-flex min-h-[46px] items-center rounded-full border border-white/10 bg-white/[0.04] px-6 font-semibold text-white transition hover:bg-white/[0.08]"
          onClick={onBack}
        >
          Back
        </button>
        <button
          type="button"
          className="inline-flex min-h-[46px] items-center rounded-full bg-gradient-to-br from-brand-accent to-brand-blue px-6 font-bold text-slate-900 transition hover:-translate-y-px hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={onNext}
          disabled={!isValid}
        >
          Continue to Payment
        </button>
      </div>
    </div>
  );
}
