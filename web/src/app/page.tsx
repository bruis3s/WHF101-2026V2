import { getInformation } from '@/lib/data';

export default function HomePage() {
  const info = getInformation();

  return (
    <main className="homePage" data-page="home">
      <h1 className="visuallyHidden">
        HAF WERKS — Explorative Architecture, Objects and Spatial Design Practice
      </h1>

      {/* Spacer pushes content to bottom */}
      <div className="homeSpacer" />

      {/* Bottom info section */}
      <section className="homeInfo" aria-label="Introduction and Studio Information">
        {/* Group 1: Introduction & Contact */}
        <div className="homeGroup1">
          <span className="homeLabel">introduction</span>
          <div className="homeGroupContent">
            <div className="homeEntryRow">
              <span className="homePrefix">a:</span>
              <span className="homeEntryValue">{info.about.statement}</span>
            </div>
            <div className="homeContactSection">
              <div className="homeEntryRow">
                <span className="homePrefix">e:</span>
                <a href={`mailto:${info.contact.email}`} className="homeEntryValue">
                  {info.contact.email}
                </a>
              </div>
              <div className="homeEntryRow">
                <span className="homePrefix">p:</span>
                <a href={`tel:${info.contact.phoneRaw}`} className="homeEntryValue">
                  {info.contact.phone}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Group 2: Studio Location */}
        <div className="homeGroup2">
          <span className="homeLabel">studio</span>
          <div className="homeGroupContent">
            <span>{info.studio.location}</span>
          </div>
        </div>
      </section>
    </main>
  );
}
