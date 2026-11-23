import { IconChevronDown } from '@tabler/icons-react';
import { ProfilProse } from './ProfilCard';
import type { ProseSplit } from './prose-split';
import p from './profil-prose.module.css';

/** Akordion per pembahasan (<details> bawaan browser): pembahasan pertama terbuka, sisanya tertutup. */
export function ProfilAccordion({ split }: { split: ProseSplit }) {
  return (
    <div className={p.accordion}>
      {split.intro.trim() ? <ProfilProse html={split.intro} className={p.flush} /> : null}
      {split.sections.map((section, index) => (
        <details key={`${index}-${section.title}`} className={p.panel} open={index === 0}>
          <summary className={p.summary}>
            <span>{section.title}</span>
            <IconChevronDown className={p.chevron} aria-hidden />
          </summary>
          <ProfilProse html={section.html} className={p.panelBody} />
        </details>
      ))}
    </div>
  );
}
