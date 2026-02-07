import Section from "../components/Section.jsx";

export default function Hero() {
  return (
    <Section id="home" title="">

      <div className="heroStage">
      
        <h1 className="heroTitle" data-text="Welcome to PETRUL">Welcome to PETRUL</h1>

        <p className="heroSubtitle">
          A mystical journey through the ancient world of petroleum and entertainment
        </p>

        <div className="heroCtas">
          <a className="btn primary" href="#game">Play Barron Simulator →</a>
          <a className="btn" href="#about">Learn More</a>
        </div>
      </div>
    </Section>
  );
}
