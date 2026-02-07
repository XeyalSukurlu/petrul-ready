export default function SocialBar() {
  return (
    <div className="socialBar">
      <div className="socialInner">
        <button className="btn disabled" disabled title="Closed for now">Telegram (Closed)</button>
        <button className="btn disabled" disabled title="Closed for now">Discord (Closed)</button>
        <a className="btn primary" href="https://x.com/Petrulom" target="_blank" rel="noreferrer">X</a>
      </div>
    </div>
  );
}
