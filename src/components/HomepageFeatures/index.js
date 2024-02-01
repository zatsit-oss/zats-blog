import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'Écrire pour partager',
    Svg: require('@site/static/img/learning-amico.svg').default,
    urlSvg: 'https://storyset.com/people',
    description: (
      <>
        Nos collaborateurs ont du talent et souhaitent vous partager leurs connaissances, leurs valeurs. N'hésite pas à partager si tu aimes.
      </>
    ),
  },
  {
    title: 'Simple et efficace',
    Svg: require('@site/static/img/website-designer-cuate.svg').default,
    urlSvg: 'https://storyset.com/people',
    description: (
      <>
        Ce blog a été entièrement généré et ne nécessite pas de ressources gourmandes 24/7. 
      </>
    ),
  },
  {
    title: 'Si tu aimes ce que tu lis',
    Svg: require('@site/static/img/resume-amico.svg').default,
    urlSvg: 'https://storyset.com/people',
    description: (
      <>
        Tu pourrais aussi faire partie de l'aventure ! Rejoindre une équipe motivée par la qualité, la sobriété et le partage.
        Contacte nous par <a href={"mailto:emplois@zatsit.fr"} aria-label="Contacte-nous par mail" style={{textDecoration: 'underline', fontWeight: 'bold'}}>mail ici</a>
      </>
    ),
  },
];

function Feature({Svg, urlSvg,title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <a href={urlSvg} aria-label="Visit storyset website for amazing illustrations"><Svg className={styles.featureSvg} role="img" /></a>
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
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
      </div>
    </section>
  );
}
