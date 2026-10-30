import type { Metadata } from 'next';
import { getInformation } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Information',
  description:
    'H A F WERKS is an Explorative Architecture, Objects and Spatial Design Practice, established in 2020.',
};

export default function InformationPage() {
  const info = getInformation();

  return (
    <main className="infoPage" data-page="information">
      <h1 className="visuallyHidden">Information — HAF WERKS</h1>

      <div className="infoTop">
        {/* Row 1: About Studio + Services Label + Narrative Paragraph & Services List in Col 3 */}
        <div className="infoRow">
          {/* Col 1: about studio label */}
          <div className="infoCol1">
            <span className="whiteBlock">{info.about.title}</span>
          </div>

          {/* Col 2 & Col 3 Container (gap: 120px) */}
          <div className="infoCol23Wrapper">
            {/* Col 2: services label aligned vertically with services items */}
            <div className="infoCol2Services">
              <span className="whiteBlock">services</span>
            </div>

            {/* Col 3: Single white container grouping narrative paragraph and services list */}
            <div className="infoCol3AboutServices">
              <p className="infoAboutText">{info.about.description}</p>

              <div className="infoServicesList">
                {info.services.map((service) => (
                  <span key={service} className="infoServiceItem">
                    {service}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: People */}
        <div className="infoRow infoRowFilled">
          {/* Col 1: people label */}
          <div className="infoCol1">
            <span className="whiteBlock">people</span>
          </div>

          {/* Col 2 Offset (227.94px) landing in Col 3 */}
          <div className="infoCol2Offset">
            <div className="infoPeopleBlock">
              <p className="infoPeopleText">{info.people.join(', ')}</p>
            </div>
          </div>
        </div>

        {/* Row 3: Studio */}
        <div className="infoRow infoRowFilled">
          {/* Col 1: studio label */}
          <div className="infoCol1">
            <span className="whiteBlock">studio</span>
          </div>

          {/* Col 2 & Col 3 Container */}
          <div className="infoCol23Wrapper">
            {/* Col 2: empty spacer (107.94px) */}
            <div className="infoStudioSpacer" aria-hidden="true" />

            {/* Col 3: Location */}
            <span className="whiteBlock">{info.studio.location}</span>
          </div>
        </div>
      </div>

      {/* Spacer pushing bottom contact to bottom of viewport */}
      <div className="infoSpacer" />

      {/* Bottom Section: Contact */}
      <div className="infoBottom">
        <div className="infoContactRow">
          {/* Col 2: contact label */}
          <div className="infoCol2Contact">
            <span className="whiteBlock">contact</span>
          </div>

          {/* Col 3: contact list */}
          <div className="infoContactList">
            <div className="infoContactEntry">
              <span className="contactPrefix">e:</span>
              <a href={`mailto:${info.contact.email}`} className="contactLink">
                {info.contact.email}
              </a>
            </div>
            <div className="infoContactEntry">
              <span className="contactPrefix">p:</span>
              <a href={`tel:${info.contact.phoneRaw}`} className="contactLink">
                {info.contact.phone}
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
