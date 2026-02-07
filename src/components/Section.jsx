export default function Section({ id, title, children }) {
  return (
    <section id={id} className="section">
      <div className="sectionInner">
        {title ? <h2 className="sectionTitle">{title}</h2> : null}
        <div className="sectionBody">{children}</div>
      </div>
    </section>
  );
}
