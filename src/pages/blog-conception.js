// <WebsiteCarbonBadge lang="fr" url={"https://zatsit-blog.web.app/"} />
import React from 'react';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {useColorMode} from '@docusaurus/theme-common';
import {WebsiteCarbonBadge} from 'react-websitecarbon-badge';

import styles from './blog.conception.module.css';

const ZatsCarbonBadge = () => {
    const {colorMode, setColorMode} = useColorMode();

    return (
        <WebsiteCarbonBadge lang="fr" dark={colorMode === 'dark'} co2="0.12" percentage="89"/>
    );
};

export default function BlogConception() {
    const {siteConfig} = useDocusaurusContext();
    return (
        <Layout title={`Eco conception de ${siteConfig.title}`}
                description="Description will go into a meta tag in <head />">
            <div>
                <header className="hero hero--primary heroBanner_src-pages-index-module">
                    <div className="container">
                        <h1 className="hero__title">Eco conception de {siteConfig.title}</h1>
                        <p className="hero__subtitle">Nous avons souhaité un blog léger, performant et ne nécessitant
                            que peu de ressources</p>
                    </div>
                </header>
                <main>
                    <section className="features_src-components-HomepageFeatures-styles-module">
                        <div className="container">
                            <div className="myRow">
                                <p >
                                    Nous accordons une grande importance à l'éco-conception et la sobriété dans tous nos
                                    projets. La préservation de l'environnement est une responsabilité que nous prenons à cœur.
                                    Dans cet esprit, nous utilisons le service de mesure de l'empreinte carbone en
                                    ligne, <a href={"https://www.websitecarbon.com/"} aria-label={"Lien vers la page d'accueil"}>WebsiteCarbon</a>,
                                    pour évaluer et minimiser l'impact écologique de nos sites web.
                                    <br /><br />
                                    <ZatsCarbonBadge/>
                                    <br /><br />

                                    Grâce à cette approche, nous nous efforçons de créer des expériences numériques durables
                                    et respectueuses de l'environnement. La transparence fournie par WebsiteCarbon nous
                                    permet de quantifier les émissions de CO2 associées à nos projets en ligne, nous aidant
                                    ainsi à prendre des décisions informées pour réduire notre empreinte carbone numérique.
                                    <br /><br />
                                    Nous croyons en la puissance de l'innovation responsable, et l'utilisation de WebsiteCarbon
                                    est un pas concret vers la construction d'un avenir numérique plus écologique.
                                    </p>
                            </div>
                        </div>
                    </section>
                </main>
            </div>

        </Layout>
    )
        ;
}

