import type { Metadata } from "next";
import { Big_Shoulders, Newsreader, IBM_Plex_Mono } from "next/font/google";
import { GuideNav, GuideChapterLinks } from "@/components/GuideNav";
import "./guide.css";

const bigShoulders = Big_Shoulders({
  subsets: ["latin"],
  weight: ["500", "700", "800"],
  variable: "--font-guide-display",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-guide-body",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-guide-mono",
});

export const metadata: Metadata = {
  title: "Promoter Playbook — RaceLineup",
  description:
    "A complete guide for race promoters to set up, run, and wrap up events in RaceLineup.",
};

export default function GuidePage() {
  return (
    <div
      className={`guide ${bigShoulders.variable} ${newsreader.variable} ${plexMono.variable}`}
    >
      <div className="shell">
        <aside className="toc" id="toc-desktop">
          <div className="toc-brand">
            <span className="flag">🏁</span>
            <span>Promoter Playbook</span>
          </div>
          <GuideNav />
          <div className="toc-foot">
            RaceLineup is built for one job: keep everyone at the gate
            looking at the same lineup you are.
          </div>
        </aside>

        <main>
          <details className="toc-mobile">
            <summary>🏁 Promoter Playbook — Contents</summary>
            <nav>
              <GuideChapterLinks />
            </nav>
          </details>

          <header className="intro">
            <span className="eyebrow">For race promoters</span>
            <h1>
              Running an event
              <br />
              in RaceLineup
            </h1>
            <p className="lede">
              Everything from creating your event to calling the last moto
              &mdash; in the order you&apos;ll actually use it. Bookmark this
              page; the last section is a fast lookup for race day.
            </p>

            <div className="phases">
              <div className="phase">
                <div className="num">Before the gate</div>
                <h3>Set up</h3>
                <p>
                  Create the event, build practice and race schedules,
                  publish the link.
                </p>
              </div>
              <div className="phase">
                <div className="num">Gate drops</div>
                <h3>Run it live</h3>
                <p>
                  Advance through practice, then the lineup, one moto at a
                  time.
                </p>
              </div>
              <div className="phase">
                <div className="num">Checkered flag</div>
                <h3>Wrap up</h3>
                <p>
                  Mark it complete so the public list and page reflect that
                  it&apos;s over.
                </p>
              </div>
            </div>
          </header>

          <section className="chapter prose" id="sign-in">
            <div className="chapter-head">
              <span className="n">00</span>
              <h2>Signing in</h2>
            </div>
            <p className="chapter-kicker">
              Your account is created by an admin &mdash; you can&apos;t
              self-register.
            </p>

            <p>
              Go to the site and choose <strong>Sign in</strong> from the top
              bar. You&apos;ll sign in with either an email address or a
              username, whichever your account was set up with, plus your
              password.
            </p>

            <p>
              Your name in the top bar is always a link to{" "}
              <strong>Your profile</strong>, where you can change your
              password or attach a recovery email at any time &mdash; worth
              doing early if your account was created with a username only,
              since a recovery email is what makes a self-service password
              reset possible later.
            </p>
          </section>

          <div className="gate">
            <span></span>
            <span></span>
            <span></span>
          </div>

          <section className="chapter prose" id="create-event">
            <div className="chapter-head">
              <span className="n">01</span>
              <h2>Create your event</h2>
            </div>
            <p className="chapter-kicker">
              One form, four fields, and you&apos;re at the control panel.
            </p>

            <p>
              From your dashboard, click{" "}
              <span className="btn primary">New event</span> and fill in:
            </p>
            <ul>
              <li>
                <strong>Event name</strong> &mdash; shown to racers
                everywhere, from the public page title to printed sheets.
              </li>
              <li>
                <strong>Location</strong> &mdash; the track or venue.
              </li>
              <li>
                <strong>Date</strong> &mdash; a single date, no time of day.
                RaceLineup runs off this date for sorting events into
                Upcoming/Past and for wrapping the event up later (more in{" "}
                <a href="#wrap-up">Wrap up</a>).
              </li>
              <li>
                <strong>Public URL</strong> &mdash; the link racers will use,
                e.g.{" "}
                <code>
                  racelineup.example.com/events/<em>your-slug</em>
                </code>
                . It fills itself in from the event name as you type; edit it
                directly if you want something shorter.
              </li>
            </ul>

            <div className="callout tip">
              <span className="label">Good to know</span>
              <p>
                Your event starts on the <strong>practice</strong> schedule
                and in <strong>Draft</strong> &mdash; nothing is public until
                you publish it (<a href="#publish">step 03</a>). Take your
                time building the schedule first.
              </p>
            </div>

            <p>
              If your account is an admin account rather than a promoter
              account, you&apos;ll also see a required{" "}
              <strong>Promoter</strong> dropdown here to assign the event to
              an actual promoter &mdash; admin accounts don&apos;t own events
              themselves. Regular promoter accounts don&apos;t see this
              field; your own events are automatically yours.
            </p>
          </section>

          <div className="gate">
            <span></span>
            <span></span>
            <span></span>
          </div>

          <section className="chapter prose" id="schedule">
            <div className="chapter-head">
              <span className="n">02</span>
              <h2>Build the schedule</h2>
            </div>
            <p className="chapter-kicker">
              Practice and the race lineup are separate schedules, each with
              the same two ways to build it.
            </p>

            <p>
              From the event&apos;s control panel, use{" "}
              <span className="btn">Edit practice</span> or{" "}
              <span className="btn">Edit lineup</span>. Both editors work the
              same way &mdash; upload a spreadsheet, build it by hand, or
              both:
            </p>

            <ul>
              <li>
                <strong>Upload a schedule.</strong> Download the Excel or CSV
                template, fill it out, and upload it &mdash; this replaces
                the whole schedule in one shot. Once you have a real schedule
                saved, the same box also offers{" "}
                <strong>Download current lineup</strong> /{" "}
                <strong>Download current schedule</strong> links (Excel or
                CSV) &mdash; useful for editing an existing schedule in a
                spreadsheet instead of the on-page editor, since a downloaded
                file uploads again unchanged.
              </li>
              <li>
                <strong>Build it manually</strong>, below the upload box
                &mdash; add rows directly on the page.
              </li>
            </ul>

            <h3 className="sub">Race lineup</h3>
            <p>
              A lineup is races, each holding one or more gate drops, each
              holding one or more classes:
            </p>
            <ul>
              <li>
                <strong>Race #</strong> and <strong>Laps</strong> &mdash;
                laps apply to the whole race, so every gate drop inside it
                runs the same distance.
              </li>
              <li>
                <strong>Gate Drop #</strong> &mdash; a race can have more
                than one gate if you&apos;re combining classes into separate
                starts.
              </li>
              <li>
                <strong>Class Name</strong> and{" "}
                <strong># of Racers</strong> &mdash; one row per class within
                a gate drop.
              </li>
            </ul>
            <div className="callout warn">
              <span className="label">Worth knowing</span>
              <p>
                Saving the lineup &mdash; by upload or by hand &mdash; resets
                the live position back to the start of the race order. Fine
                before the event; avoid re-saving mid-event unless you mean
                to restart.
              </p>
            </div>

            <h3 className="sub">Practice schedule</h3>
            <p>A flat list of sessions &mdash; no gate drops:</p>
            <ul>
              <li>
                <strong>Practice #</strong> and <strong>Description</strong>{" "}
                &mdash; e.g. &ldquo;Big Bikes Novice/Beginner&rdquo;.
              </li>
              <li>
                <strong>Duration</strong> &mdash; exactly one of{" "}
                <strong>Minutes</strong> or <strong>Laps</strong> per
                session.
              </li>
            </ul>
          </section>

          <div className="gate">
            <span></span>
            <span></span>
            <span></span>
          </div>

          <section className="chapter prose" id="publish">
            <div className="chapter-head">
              <span className="n">03</span>
              <h2>Publish it</h2>
            </div>
            <p className="chapter-kicker">
              The link is safe to share before you publish &mdash; visitors
              just won&apos;t see the lineup yet.
            </p>

            <p>
              Click <span className="btn primary">Publish</span> on the
              control panel when you&apos;re ready for the public to see the
              schedule. Until then, anyone who opens the link sees:
            </p>

            <div className="mock">
              <div className="mock-row">
                <span className="mock-title">Your Event Name</span>
              </div>
              <div className="mock-row mock-sub">
                Your Track &middot; Event date
              </div>
              <hr />
              <div className="mock-row">
                The race lineup is not yet posted.
              </div>
              <div className="mock-row mock-sub">Check back soon.</div>
            </div>

            <p>
              That&apos;s why <span className="btn">Copy link</span> and{" "}
              <span className="btn">Show QR code</span> (see{" "}
              <a href="#share">Share with racers</a>) are safe to hand out
              days ahead of the event &mdash; nobody sees a broken link or a
              404, just a friendly &ldquo;not yet posted.&rdquo;
            </p>
          </section>

          <div className="gate">
            <span></span>
            <span></span>
            <span></span>
          </div>

          <section className="chapter prose" id="run-live">
            <div className="chapter-head">
              <span className="n">04</span>
              <h2>Run it live</h2>
            </div>
            <p className="chapter-kicker">
              Practice and Race each get their own Move back / Advance /
              Restart, and only one is ever public at a time.
            </p>

            <p>
              Your control panel shows whichever schedule is currently
              public first and open, with the other collapsed below it and
              labeled <em>(not showing publicly)</em> &mdash; so mid-event
              you&apos;re not scrolling past controls you&apos;re not using,
              but can still check them.
            </p>

            <div className="mock">
              <div className="mock-row">
                <span className="mock-title">Practice</span>
              </div>
              <div className="mock-row">
                <span className="btn">&larr; Move back</span>
                <span className="btn primary">Advance &rarr;</span>
                <span className="btn danger">Restart practice</span>
              </div>
              <hr />
              <div className="mock-row">
                Practice #2 &middot; 6 min{" "}
                <span className="badge track">On track</span>
              </div>
              <div className="mock-row mock-sub">
                Big Bikes Novice/Beginner
              </div>
              <div className="mock-row">
                Practice #3 &middot; 6 min{" "}
                <span className="badge line">On The Line</span>
              </div>
              <div className="mock-row mock-sub">85cc/Supermini</div>
            </div>

            <p>
              The badges track your position for racers watching the page:{" "}
              <span className="badge track">On track</span> marks
              what&apos;s running right now, <span className="badge line">
                On The Line
              </span>{" "}
              marks what&apos;s staged up next. The public page auto-scrolls
              to whichever one is current the moment it loads, and refreshes
              itself every 60&nbsp;seconds &mdash; nobody needs to hit reload
              trackside.
            </p>

            <p>
              <span className="btn primary">Advance &rarr;</span> moves to
              the next item and grays out once you&apos;ve hit the last one.{" "}
              <span className="btn">&larr; Move back</span> steps back one.{" "}
              <span className="btn danger">Restart</span> asks you to
              confirm, then clears the current position entirely and scrolls
              your panel back to the top.
            </p>

            <p>
              When practice wraps up, switch what the public sees with the
              toggle above the schedules:
            </p>
            <div className="mock">
              <div className="mock-row">
                Public page is currently showing:{" "}
                <strong>Practice schedule</strong>
              </div>
              <div className="mock-row">
                <span className="btn primary">
                  Switch to race lineup &rarr;
                </span>
              </div>
            </div>
            <p>
              Each schedule remembers its own position independently &mdash;
              switching back to practice later picks up exactly where you
              left it, and the badges only ever show on whichever one is
              actually live. The controls for the schedule that{" "}
              <em>isn&apos;t</em> live are disabled, both so you don&apos;t
              advance the wrong one by habit and as a backstop if you try
              anyway.
            </p>
          </section>

          <div className="gate">
            <span></span>
            <span></span>
            <span></span>
          </div>

          <section className="chapter prose" id="share">
            <div className="chapter-head">
              <span className="n">05</span>
              <h2>Share with racers</h2>
            </div>
            <p className="chapter-kicker">
              One link, a QR code for the pit board, and a printable sheet
              for the table by gate.
            </p>

            <ul>
              <li>
                <span className="btn">Copy link</span> &mdash; copies the
                public page URL to your clipboard.
              </li>
              <li>
                <span className="btn">Show QR code</span> &mdash; generates
                one on the spot; screenshot it for a pit-board flyer or event
                listing.
              </li>
              <li>
                <span className="btn">Print PDF</span> &mdash; a letter-size,
                print-ready table (race, laps, gate, class, riders &mdash; or
                practice number, description, duration), grouped clearly by
                race with headers repeating on every page. Each schedule has
                its own Print PDF button on your control panel; racers get
                one on the public page too, which always follows whichever
                schedule is currently live.
              </li>
            </ul>
          </section>

          <div className="gate">
            <span></span>
            <span></span>
            <span></span>
          </div>

          <section className="chapter prose" id="wrap-up">
            <div className="chapter-head">
              <span className="n">06</span>
              <h2>Wrap up</h2>
            </div>
            <p className="chapter-kicker">
              Closing out an event takes it off the public list without
              erasing anything.
            </p>

            <p>
              Once the event is over and published, click{" "}
              <span className="btn primary">Mark event complete</span> on the
              control panel (you&apos;ll be asked to confirm). Its public
              page then reads:
            </p>
            <div className="mock">
              <div className="mock-row mock-sub">
                This event has concluded.
              </div>
            </div>
            <p>
              and it disappears entirely from the public events list &mdash;
              though it stays right where it was on{" "}
              <strong>your</strong> dashboard, now marked{" "}
              <span className="badge done">Completed</span>, so you can still
              open it, check the final lineup, or reprint it.
            </p>

            <div className="callout tip">
              <span className="label">Changed your mind?</span>
              <p>
                An <span className="btn">Uncomplete event</span> button
                appears in its place &mdash; but only works within
                3&nbsp;days of the event date. After that it&apos;s disabled
                with a tooltip explaining why: an event that old
                auto-completes itself again the moment anyone loads a page
                that touches it, so un-completing it wouldn&apos;t stick.
              </p>
            </div>

            <p>
              That auto-completion is also a safety net on its own &mdash;{" "}
              <strong>
                any event more than 3 days past its date gets marked
                complete automatically
              </strong>
              , even if you never click the button. You don&apos;t have to
              remember to close out every small event; RaceLineup catches up
              on its own.
            </p>

            <p>
              If you need to remove an event outright &mdash; wrong details,
              a duplicate, a cancelled date &mdash; the control panel&apos;s{" "}
              <strong>Danger zone</strong> has a{" "}
              <span className="btn danger">Delete event</span> button. It
              asks you to confirm by name, then permanently removes the
              event, its full lineup, and its practice schedule.
              There&apos;s no undo, so reach for{" "}
              <strong>Mark event complete</strong> instead unless you
              actually want it gone.
            </p>
          </section>

          <div className="gate">
            <span></span>
            <span></span>
            <span></span>
          </div>

          <section className="chapter prose" id="events-list">
            <div className="chapter-head">
              <span className="n">07</span>
              <h2>Your events list</h2>
            </div>
            <p className="chapter-kicker">
              Sorted the way a season actually runs: what&apos;s next, then
              what just happened.
            </p>

            <p>
              Your dashboard splits into <strong>Upcoming</strong> (soonest
              first) and <strong>Past Events</strong> (most recent first)
              automatically, based on each event&apos;s date. Past Events
              only shows the last 30 days by default &mdash; click{" "}
              <span className="btn">Show N more</span> to bring the rest of
              your history into view without leaving the page.
            </p>
          </section>

          <div className="gate">
            <span></span>
            <span></span>
            <span></span>
          </div>

          <section className="chapter prose" id="quick-reference">
            <div className="chapter-head">
              <span className="n">08</span>
              <h2>Quick reference</h2>
            </div>
            <p className="chapter-kicker">
              For race day, when you need an answer faster than a paragraph.
            </p>

            <div className="table-wrap">
              <table className="ref">
                <thead>
                  <tr>
                    <th>Control</th>
                    <th>Where</th>
                    <th>What it does</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="mono">Advance &rarr;</td>
                    <td className="who">Practice / Race</td>
                    <td>
                      Moves to the next session or race. Grays out at the
                      end.
                    </td>
                  </tr>
                  <tr>
                    <td className="mono">&larr; Move back</td>
                    <td className="who">Practice / Race</td>
                    <td>Steps back one item.</td>
                  </tr>
                  <tr>
                    <td className="mono">Restart</td>
                    <td className="who">Practice / Race</td>
                    <td>
                      Confirms, then clears the current position back to the
                      start.
                    </td>
                  </tr>
                  <tr>
                    <td className="mono">
                      Switch to race lineup / Back to practice
                    </td>
                    <td className="who">Control panel</td>
                    <td>
                      Changes which schedule the public page shows. Each
                      keeps its own position.
                    </td>
                  </tr>
                  <tr>
                    <td className="mono">Publish / Unpublish</td>
                    <td className="who">Control panel</td>
                    <td>
                      Toggles whether the public page shows the lineup or
                      &ldquo;not yet posted.&rdquo;
                    </td>
                  </tr>
                  <tr>
                    <td className="mono">Mark event complete</td>
                    <td className="who">Control panel</td>
                    <td>
                      Confirms, then shows &ldquo;concluded&rdquo; publicly
                      and drops the event from the public list. Published
                      events only.
                    </td>
                  </tr>
                  <tr>
                    <td className="mono">Uncomplete event</td>
                    <td className="who">Control panel</td>
                    <td>
                      Undoes the above &mdash; only within 3 days of the
                      event date.
                    </td>
                  </tr>
                  <tr>
                    <td className="mono">Delete event</td>
                    <td className="who">Danger zone</td>
                    <td>
                      Confirms, then permanently removes the event and
                      everything in it.
                    </td>
                  </tr>
                  <tr>
                    <td className="mono">Copy link / Show QR code</td>
                    <td className="who">Control panel</td>
                    <td>Ways to hand racers the public page URL.</td>
                  </tr>
                  <tr>
                    <td className="mono">Print PDF</td>
                    <td className="who">Each schedule, and the public page</td>
                    <td>
                      Letter-size printable table of whichever schedule
                      you&apos;re viewing.
                    </td>
                  </tr>
                  <tr>
                    <td className="mono">
                      Download current lineup/schedule
                    </td>
                    <td className="who">Edit lineup / Edit practice</td>
                    <td>
                      Excel or CSV export of what&apos;s saved now &mdash;
                      re-uploads unchanged.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="table-wrap">
              <table className="ref">
                <thead>
                  <tr>
                    <th>Badge</th>
                    <th>Meaning</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <span className="badge track">On track</span>
                    </td>
                    <td>What&apos;s running right now.</td>
                  </tr>
                  <tr>
                    <td>
                      <span className="badge line">On The Line</span>
                    </td>
                    <td>Staged up next.</td>
                  </tr>
                  <tr>
                    <td>
                      <span className="badge pub">Published</span>
                    </td>
                    <td>
                      Visible to the public (as &ldquo;not yet posted&rdquo;
                      until you publish).
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <span className="badge done">Completed</span>
                    </td>
                    <td>
                      Wrapped up &mdash; off the public list, still on your
                      dashboard.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <footer className="page">
              Something not covered here, or not matching what you&apos;re
              seeing on screen? Ask whoever manages your RaceLineup
              deployment &mdash; this playbook covers the promoter side of
              the app as built.
            </footer>
          </section>
        </main>
      </div>
    </div>
  );
}
