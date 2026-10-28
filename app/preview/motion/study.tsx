import Image from "next/image";
import { Container } from "@/components/layout/Container";
import { ButtonLink } from "@/components/links/ButtonLink";
import { SiteLink } from "@/components/links/SiteLink";
import { Photo } from "@/components/media/Photo";
import { Badge } from "@/components/ui/badge";
import { bookingLink, footerContacts, site } from "@/config/site";
import { home } from "@/content/home";
import { images } from "@/content/images";
import { cn } from "@/lib/utils";
import type { Media } from "@/lib/types";
import styles from "./motion.module.css";
import { Reveal } from "./reveal";

const delay = [styles.d0, styles.d1, styles.d2, styles.d3, styles.d4, styles.d5, styles.d6, styles.d7] as const;

function at(index: number) {
  return delay[Math.min(index, delay.length - 1)];
}

function rowLines(row: (typeof home.location.rows)[number]) {
  if ("lines" in row && row.lines) return row.lines;
  return site.hours.items;
}

function HeroFade({ frames }: { frames: readonly [Media, Media, Media] }) {
  const [base, mid, end] = frames;
  return (
    <div className={styles.stack}>
      <Image
        src={base.src}
        alt=""
        width={1050}
        height={1400}
        sizes="(min-width: 64rem) 42vw, 100vw"
        priority
        aria-hidden
        className={cn(styles.shot, styles.shotBase)}
      />
      <Image
        src={mid.src}
        alt=""
        width={1050}
        height={1400}
        sizes="(min-width: 64rem) 42vw, 100vw"
        aria-hidden
        className={cn(styles.shot, styles.shotMid)}
      />
      <Image
        src={end.src}
        alt={end.alt}
        width={1050}
        height={1400}
        sizes="(min-width: 64rem) 42vw, 100vw"
        className={cn(styles.shot, styles.shotEnd)}
      />
    </div>
  );
}

function EnterFade({ frames }: { frames: readonly [Media, Media] }) {
  const [base, next] = frames;
  return (
    <div className={styles.stack}>
      <Image
        src={base.src}
        alt=""
        width={1050}
        height={1400}
        sizes="(min-width: 64rem) 70vw, 100vw"
        aria-hidden
        className={cn(styles.shot, styles.shotBase)}
      />
      <Image
        src={next.src}
        alt={next.alt}
        width={1050}
        height={1400}
        sizes="(min-width: 64rem) 70vw, 100vw"
        className={cn(styles.shot, styles.enterShot)}
      />
    </div>
  );
}

export function MotionStudy() {
  const phones = footerContacts.filter((link) => link.href.startsWith("tel:"));
  const titleCount = home.hero.titleLines.length;
  const heroFrames = [images.hero, images.counseling, images.waiting] as const;
  const spaceFrames = [home.space.items[0], home.space.items[1]] as const;
  const spaceRest = home.space.items.slice(2);

  return (
    <div className={styles.root} data-preview="motion">
      <section className={styles.hero}>
        <div className={styles.field} aria-hidden="true" />
        <div className={styles.heroInner}>
          <Container>
            <div className={styles.heroGrid}>
              <div className={styles.mark}>
                <Image
                  src={site.logo.symbol}
                  alt={site.logo.alt}
                  width={602}
                  height={463}
                  className="logo-mark"
                />
                <span className={styles.word}>
                  <span className="type-sm font-semibold text-ink">{site.wordmark.title}</span>
                  <span className="type-xs text-ink-3">{site.wordmark.subtitle}</span>
                </span>
              </div>
              <div className={styles.titles}>
                <p className={cn(styles.line, at(0), "type-eyebrow-en")}>{home.hero.eyebrow}</p>
                <h1 className="type-display">
                  {home.hero.titleLines.map((line, index) => (
                    <span key={line} className={cn(styles.line, at(index + 1), "block")}>
                      {line}
                    </span>
                  ))}
                </h1>
              </div>
              <div className={styles.heroPhoto}>
                <HeroFade frames={heroFrames} />
              </div>
              <div className={styles.rest}>
                <p className={cn(styles.line, at(titleCount + 1), "type-lead")}>{home.hero.lead}</p>
                <div className={cn(styles.line, styles.actions, at(titleCount + 2))}>
                  <ButtonLink link={bookingLink} size="lg">
                    {home.hero.primaryCta}
                  </ButtonLink>
                  <div className={styles.phones}>
                    {phones.map((link) => (
                      <SiteLink key={link.href} link={link} className="type-sm text-ink" />
                    ))}
                  </div>
                </div>
                <ul className={cn(styles.line, styles.notes, at(titleCount + 3))}>
                  {home.hero.note.map((note) => (
                    <li key={note} className="type-sm text-ink-2">
                      {note}
                    </li>
                  ))}
                </ul>
                <div className={cn(styles.line, styles.float, at(titleCount + 4))}>
                  <p className="type-xs font-semibold text-coral">{home.hero.floatCard.label}</p>
                  <p className="type-h3 text-ink">{home.hero.floatCard.title}</p>
                  <p className="type-sm text-ink-2">{home.hero.floatCard.detail}</p>
                  <p className="type-sm font-semibold text-brand">{home.hero.floatCard.price}</p>
                </div>
              </div>
            </div>
          </Container>
        </div>
      </section>

      <section className={cn(styles.tight, styles.rule)}>
        <Container>
          <Reveal className={styles.reveal}>
            <ul className={styles.stats}>
              {home.stats.map((item, index) => (
                <li key={item.label} className={cn(styles.line, styles.stat, at(index))}>
                  <p className="type-stat text-ink">
                    {item.value}
                    {item.unit ? <span className="type-h3">{item.unit}</span> : null}
                  </p>
                  <p className="type-sm text-ink-2">{item.label}</p>
                  {"sub" in item && item.sub ? <p className="type-xs text-ink-3">{item.sub}</p> : null}
                </li>
              ))}
            </ul>
          </Reveal>
        </Container>
      </section>

      <section className={styles.section}>
        <Container>
          <Reveal className={cn(styles.reveal, styles.seq)}>
            <p className={cn(styles.line, at(0), "type-eyebrow-en")}>{home.programs.eyebrow}</p>
            <h2 className={cn(styles.line, at(1), "type-h2")}>{home.programs.title}</h2>
            <p className={cn(styles.line, at(2), "type-lead")}>{home.programs.lead}</p>
            <div className={styles.cards}>
              {home.programs.items.map((item, index) => (
                <article key={item.href} className={cn(styles.card, styles.line, at(index + 3))}>
                  <figure className={styles.figure}>
                    <Photo image={item.image} sizes="(min-width: 64rem) 40vw, 100vw" frame="none" className={styles.cover} />
                  </figure>
                  <p className="type-eyebrow-en">{item.tag}</p>
                  <h3 className="type-h3">
                    <SiteLink link={{ href: item.href, label: item.title, external: false }} />
                  </h3>
                  <p className="type-sm text-ink-2">{item.desc}</p>
                </article>
              ))}
            </div>
            <p className={cn(styles.line, at(7))}>
              <SiteLink
                link={{ href: "/programs", label: home.programs.more, external: false }}
                className="type-sm font-semibold text-brand"
              />
            </p>
          </Reveal>
        </Container>
      </section>

      <section className={cn(styles.section, styles.sand)}>
        <Container>
          <Reveal className={cn(styles.reveal, styles.split)}>
            <div className={styles.seq}>
              <p className={cn(styles.line, at(0), "type-eyebrow-en")}>{home.firstVisit.eyebrow}</p>
              <h2 className={cn(styles.line, at(1), styles.pre, "type-h2")}>{home.firstVisit.title}</h2>
              <p className={cn(styles.line, at(2), "type-lead")}>{home.firstVisit.lead}</p>
              <p className={cn(styles.line, at(3), "type-stat text-ink")}>
                {home.firstVisit.price}
                <span className="type-sm ml-2 font-medium text-ink-2">{home.firstVisit.priceNote}</span>
              </p>
              <ul className={cn(styles.line, styles.includes, at(4))}>
                {home.firstVisit.includes.map((item) => (
                  <li key={item} className="type-sm text-ink-2">
                    {item}
                  </li>
                ))}
              </ul>
              <p className={cn(styles.line, at(5))}>
                <SiteLink
                  link={{ ...bookingLink, label: home.firstVisit.cta }}
                  className="type-sm font-semibold text-brand"
                />
              </p>
            </div>
            <figure className={cn(styles.line, styles.figure, at(6))}>
              <Photo
                image={home.firstVisit.image}
                sizes="(min-width: 64rem) 42vw, 100vw"
                frame="none"
                className={styles.cover}
              />
            </figure>
          </Reveal>
        </Container>
      </section>

      <section className={styles.section}>
        <Container>
          <Reveal className={cn(styles.reveal, styles.seq)}>
            <p className={cn(styles.line, at(0), "type-eyebrow-en")}>{home.director.eyebrow}</p>
            <h2 className={cn(styles.line, at(1), "type-h2")}>
              {home.director.role} {home.director.name}
            </h2>
            <p className={cn(styles.line, at(2), "type-xs text-ink-3")}>{home.director.imageNote}</p>
            <blockquote className={cn(styles.line, at(3), "type-quote")}>{home.director.quote}</blockquote>
            <p className={cn(styles.line, at(4), "type-sm font-semibold text-ink")}>{home.director.education}</p>
            <ul className={cn(styles.line, styles.creds, at(5))}>
              {home.director.credentials.slice(1).map((item) => (
                <li key={item} className="type-sm text-ink-2">
                  {item}
                </li>
              ))}
            </ul>
            <p className={cn(styles.line, at(6))}>
              <SiteLink
                link={{ href: "/about/director", label: home.director.cta, external: false }}
                className="type-sm font-semibold text-brand"
              />
            </p>
          </Reveal>
        </Container>
      </section>

      <section className={cn(styles.section, styles.band)}>
        <div className={styles.bandField} aria-hidden="true" />
        <Container className={styles.bandInner}>
          <Reveal className={cn(styles.reveal, styles.split)}>
            <div className={styles.seq}>
              <p className={cn(styles.line, at(0), "type-eyebrow-en")}>{home.privacy.eyebrow}</p>
              <h2 className={cn(styles.line, at(1), "type-h2")}>{home.privacy.title}</h2>
              <p className={cn(styles.line, at(2), "type-lead")}>{home.privacy.lead}</p>
              <ul className={styles.points}>
                {home.privacy.points.map((point, index) => (
                  <li key={point.title} className={cn(styles.line, at(index + 3))}>
                    <p className="type-h3">{point.title}</p>
                    <p className="type-sm text-ink-2">{point.desc}</p>
                  </li>
                ))}
              </ul>
            </div>
            <figure className={cn(styles.line, styles.figure, at(6))}>
              <Photo image={home.privacy.image} sizes="(min-width: 64rem) 42vw, 100vw" frame="none" className={styles.cover} />
            </figure>
          </Reveal>
        </Container>
      </section>

      <section className={styles.section}>
        <Container>
          <Reveal className={cn(styles.reveal, styles.seq)}>
            <p className={cn(styles.line, at(0), "type-eyebrow-en")}>{home.space.eyebrow}</p>
            <h2 className={cn(styles.line, at(1), "type-h2")}>{home.space.title}</h2>
            <p className={cn(styles.line, at(2), "type-lead")}>{home.space.lead}</p>
            <EnterFade frames={spaceFrames} />
            <ul className={cn(styles.line, styles.notes, at(3))}>
              {spaceFrames.map((item) => (
                <li key={item.src} className="type-sm text-ink-3">
                  {item.caption}
                </li>
              ))}
            </ul>
            <ul className={cn(styles.line, styles.thumbs, at(4))}>
              {spaceRest.map((item) => (
                <li key={item.src}>
                  <figure className={styles.figure}>
                    <Photo image={item} sizes="(min-width: 64rem) 30vw, 100vw" frame="none" className={styles.cover} />
                  </figure>
                  <p className="type-xs text-ink-3">{item.caption}</p>
                </li>
              ))}
            </ul>
          </Reveal>
        </Container>
      </section>

      <section className={cn(styles.section, styles.sand)}>
        <Container>
          <Reveal className={cn(styles.reveal, styles.seq)}>
            <p className={cn(styles.line, at(0), "type-eyebrow-en")}>{home.pricing.eyebrow}</p>
            <h2 className={cn(styles.line, at(1), "type-h2")}>{home.pricing.title}</h2>
            <div className={styles.prices}>
              {home.pricing.items.map((item, index) => (
                <article
                  key={item.name}
                  className={cn(styles.price, styles.line, item.featured && styles.featured, at(index + 2))}
                >
                  {item.badge ? <Badge variant="coral">{item.badge}</Badge> : null}
                  <h3 className="type-h3">{item.name}</h3>
                  <p className="type-stat text-ink">
                    {item.price}
                    <span className="type-sm ml-2 font-medium text-ink-2">{item.unit}</span>
                  </p>
                  <p className="type-sm text-ink-3">{item.meta}</p>
                  <p className="type-sm text-ink-2">{item.desc}</p>
                </article>
              ))}
            </div>
            <p className={cn(styles.line, at(5), "type-sm text-ink-3")}>{home.pricing.note}</p>
            <p className={cn(styles.line, at(6))}>
              <SiteLink
                link={{ href: "/pricing", label: home.pricing.cta, external: false }}
                className="type-sm font-semibold text-brand"
              />
            </p>
          </Reveal>
        </Container>
      </section>

      <section className={styles.section}>
        <Container>
          <Reveal className={cn(styles.reveal, styles.seq)}>
            <p className={cn(styles.line, at(0), "type-eyebrow-en")}>{home.process.eyebrow}</p>
            <h2 className={cn(styles.line, at(1), "type-h2")}>{home.process.title}</h2>
            <ol className={styles.steps}>
              {home.process.steps.map((step, index) => (
                <li key={step.no} className={cn(styles.line, at(index + 2))}>
                  <p className="type-eyebrow-en">{step.no}</p>
                  <p className="type-h3">{step.title}</p>
                  <p className="type-sm text-ink-2">{step.desc}</p>
                </li>
              ))}
            </ol>
          </Reveal>
        </Container>
      </section>

      <section className={cn(styles.section, styles.sand)}>
        <Container>
          <Reveal className={cn(styles.reveal, styles.seq)}>
            <p className={cn(styles.line, at(0), "type-eyebrow-en")}>{home.location.eyebrow}</p>
            <h2 className={cn(styles.line, at(1), "type-h2")}>{home.location.title}</h2>
            <div className={styles.rows}>
              {home.location.rows.map((row, index) => (
                <div key={row.label} className={cn(styles.line, at(index + 2))}>
                  <p className="type-h3">{row.label}</p>
                  {rowLines(row).map((line) => (
                    <p key={line} className="type-sm text-ink-2">
                      {line}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          </Reveal>
        </Container>
      </section>

      <section className={styles.section}>
        <Container>
          <Reveal className={cn(styles.reveal, styles.seq)}>
            <h2 className={cn(styles.line, at(0), "type-h2")}>{home.finalCta.title}</h2>
            <p className={cn(styles.line, at(1), "type-lead")}>{home.finalCta.lead}</p>
            <div className={cn(styles.line, styles.actions, at(2))}>
              <ButtonLink link={bookingLink} size="lg">
                {home.finalCta.primary}
              </ButtonLink>
              <div className={styles.phones}>
                {phones.map((link) => (
                  <SiteLink key={link.href} link={link} className="type-sm text-ink" />
                ))}
              </div>
            </div>
          </Reveal>
        </Container>
      </section>
    </div>
  );
}
