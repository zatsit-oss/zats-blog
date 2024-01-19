import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';
//<a href="https://storyset.com/people">People illustrations by Storyset</a>
const FeatureList = [
  {
    title: 'Écrire pour partager',
    Svg: require('@site/static/img/learning-amico.svg').default,
    description: (
      <>
        Nos collaborateurs ont du talent et souhaitent vous partager leurs connaissances, leurs valeurs.
      </>
    ),
  },
  {
    title: 'Simple et efficace',
    Svg: require('@site/static/img/website-designer-cuate.svg').default,
    description: (
      <>
        Ce blog a été entièrement généré et ne nécessite pas de ressources gourmandes H24.
      </>
    ),
  },
  {
    title: 'Si tu aimes ce que tu lis',
    Svg: require('@site/static/img/resume-amico.svg').default,
    description: (
      <>
        Tu pourrais aussi faire partie de l'aventure ! Rejoindre une équipe motivée par la qualité, la sobriété et le partage.
          N'hésite plus, envoie nous un <a href={"mailto:emplois@zatsit.fr"}>mail ici</a>
      </>
    ),
  },
];

function Feature({Svg, title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
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
