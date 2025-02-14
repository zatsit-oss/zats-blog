import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'Écrire pour partager',
    Svg: require('@site/static/img/learning-amico.svg').default,
    urlSvg: '/blog',
    ariaLabel: 'Blog',
    description: (
      <>
        Nos consultants ont du talent et souhaitent vous partager leurs connaissances, leurs valeurs. N'hésite pas à partager si tu aimes.
      </>
    ),
  },
  {
    title: 'Simple, efficace et surtout éco-conçu.',
    Svg: require('@site/static/img/website-designer-cuate.svg').default,
    urlSvg: '/blog-conception',
    ariaLabel: 'Éco-conception du blog',
    description: (
      <>
        Ce blog a été entièrement généré et ne nécessite pas de ressources gourmandes 24/7.
      </>
    ),
  },
  {
    title: 'Si tu aimes ce que tu lis',
    Svg: require('@site/static/img/resume-amico.svg').default,
    urlSvg: 'mailto:emplois@zatsit.fr',
    ariaLabel: 'Envoyer un mail à emplois@zatsit.fr',
    description: (
      <>
        Tu pourrais aussi faire partie de l'aventure ! Rejoindre une équipe motivée par la qualité, la sobriété et le partage.
        Contacte nous par <a href={"mailto:emplois@zatsit.fr"} style={{textDecoration: 'underline', fontWeight: 'bold'}}>mail</a>.
      </>
    ),
  },
];

function Feature({Svg, urlSvg, title, ariaLabel, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <a href={urlSvg}>
          <Svg className={styles.featureSvg} role="img" aria-label={ariaLabel}/>
        </a>
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h2">{title}</Heading>
        <p  style={{ textAlign: 'justify', padding: '0 10px' }}>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
          <p className="storySetAttribution" lang="en">The illustrations of this page comes from <b><a href={"https://storyset.com/"}>Storyset</a></b></p>
      </div>
    </section>
  );
}
