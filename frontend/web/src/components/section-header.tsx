type SectionHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  titleId?: string;
};

export function SectionHeader({ eyebrow, title, description, titleId }: SectionHeaderProps) {
  return (
    <header className="section-header">
      <p className="eyebrow">{eyebrow}</p>
      <h2 id={titleId}>{title}</h2>
      <p className="section-description">{description}</p>
    </header>
  );
}
