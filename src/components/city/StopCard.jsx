import { ArrowUpRight } from 'lucide-react';

// Renders one stop's content. Shared by the in-game info card and the
// plain-list fallback, so both always show exactly the same thing.

function ExternalLink({ href, children, className }) {
  const web = /^https?:/.test(href) || href.endsWith('.pdf');
  return (
    <a
      href={href}
      className={className}
      target={web ? '_blank' : undefined}
      rel={web ? 'noopener noreferrer' : undefined}
    >
      {children}
      {web && <ArrowUpRight size={14} aria-hidden="true" />}
      {web && <span className="city-sr"> (opens in a new tab)</span>}
    </a>
  );
}

function Tags({ items }) {
  if (!items || !items.length) return null;
  return (
    <ul className="city-tags" aria-label="Technologies">
      {items.map((tag) => (
        <li key={tag}>{tag}</li>
      ))}
    </ul>
  );
}

function Block({ block, Tag }) {
  switch (block.type) {
    case 'text':
      return <p className="city-text">{block.text}</p>;
    case 'facts':
      return (
        <dl className="city-facts">
          {block.items.map((fact) => (
            <div key={fact.label}>
              <dt>{fact.value}</dt>
              <dd>{fact.label}</dd>
            </div>
          ))}
        </dl>
      );
    case 'role':
      return (
        <section className="city-block">
          <div className="city-block__head">
            <Tag className="city-block__title">{block.role}</Tag>
            <span className="city-badge">{block.badge}</span>
          </div>
          <p className="city-meta">
            {block.org} · {block.date}
          </p>
          <ul className="city-points">
            {block.points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
          <Tags items={block.tags} />
        </section>
      );
    case 'project':
      return (
        <section className="city-block">
          <div className="city-block__head">
            <Tag className="city-block__title">{block.title}</Tag>
            <span className="city-badge">Featured · {block.date}</span>
          </div>
          <p className="city-meta">
            {block.subtitle}
            {block.note ? ` · ${block.note}` : ''}
          </p>
          <p className="city-text">{block.desc}</p>
          {block.points && (
            <ul className="city-points">
              {block.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          )}
          <div className="city-linkrow">
            {block.links.map((link) => (
              <ExternalLink key={link.href} href={link.href} className="city-chiplink">
                <span>
                  {link.label}
                  <span className="city-sr">: {block.title}</span>
                </span>
              </ExternalLink>
            ))}
          </div>
          <Tags items={block.tags} />
        </section>
      );
    case 'list':
      return (
        <section className="city-block">
          <Tag className="city-block__title">{block.title}</Tag>
          <ul className="city-minilist">
            {block.items.map((item) => (
              <li key={item.title}>
                <strong>{item.title}</strong>
                <span>{item.desc}</span>
                <ExternalLink href={item.href} className="city-inlinelink">
                  <span>
                    {item.linkLabel}
                    <span className="city-sr">: {item.title}</span>
                  </span>
                </ExternalLink>
              </li>
            ))}
          </ul>
        </section>
      );
    case 'chips':
      return (
        <section className="city-block">
          <Tag className="city-block__title">{block.title}</Tag>
          {block.desc && <p className="city-meta">{block.desc}</p>}
          <ul className="city-tags city-tags--large" aria-label={block.title}>
            {block.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      );
    case 'credential':
      return (
        <section className="city-block">
          <div className="city-block__head">
            <Tag className="city-block__title">{block.title}</Tag>
            <span className="city-badge">{block.kind}</span>
          </div>
          <p className="city-meta">{block.org}</p>
          {block.meta && (
            <ul className="city-tags city-tags--large" aria-label="Details">
              {block.meta.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
          {block.link && (
            <div className="city-linkrow">
              <ExternalLink href={block.link.href} className="city-chiplink">
                <span>{block.link.label}</span>
              </ExternalLink>
            </div>
          )}
        </section>
      );
    case 'links':
      return (
        <ul className="city-contacts">
          {block.items.map((item) => (
            <li key={item.href + item.label}>
              <span className="city-contacts__label">{item.label}</span>
              <ExternalLink href={item.href} className="city-contacts__value">
                <span>{item.value}</span>
              </ExternalLink>
            </li>
          ))}
        </ul>
      );
    default:
      return null;
  }
}

export default function StopContent({ stop, headingLevel = 3 }) {
  const Tag = `h${headingLevel}`;
  return (
    <div className="city-content">
      {stop.blocks.map((block, index) => (
        <Block key={`${block.type}-${index}`} block={block} Tag={Tag} />
      ))}
    </div>
  );
}
