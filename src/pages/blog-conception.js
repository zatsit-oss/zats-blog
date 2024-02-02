import React from 'react';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import ZatsWebsiteCarbonBadge from '../components/zatsWebsiteCarbonBadge'
import ZatsCO2JSBadge from "../components/zatsCO2JSBadge";

export default function page(){
    return (
        <BlogConception />
    );
}

const BlogConception = () => {
   // const {colorMode, setColorMode} = useColorMode();
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
                            <div className="ecoConceptionRow">
                                    Nous accordons une grande importance à l'éco-conception et la sobriété dans tous nos
                                    projets. La préservation de l'environnement est une responsabilité que nous prenons à cœur.
                                    Dans cet esprit, nous utilisons le service de mesure de l'empreinte carbone en
                                    ligne, <a href={"https://www.websitecarbon.com/"} aria-label={"Lien vers la page d'accueil"}>WebsiteCarbon</a>,
                                    pour évaluer et minimiser l'impact écologique de nos sites web.
                                    <br /><br />
                                    <ZatsWebsiteCarbonBadge/>
                                    <br /><br />
                                    Puisqu'une mesure peut être soumise à erreur, il est préférable de croiser les données et de
                                    se confronter à plusieurs outils. Vous pourrez par exemple utiliser aussi
                                    <a href={"https://developers.thegreenwebfoundation.org/co2js/tutorials/getting-started-browser/"} aria-label={"Lien vers la page d'accueil"}> CO2.js de la "Green Web Foundation"</a>, le résultat au 1er février, notre page d'accueil pèse kb (en cours d'amélioration), :
                                    <br /><br />
                                    <ZatsCO2JSBadge />

                                    <br /><br />
                                    Grâce à cette approche, nous nous efforçons de créer des expériences numériques durables
                                    et respectueuses de l'environnement. La mesure fournie par des sites comme WebsiteCarbon nous
                                    permet de quantifier les émissions de CO2 associées à nos projets en ligne, nous aidant
                                    ainsi à nous améliorer pour réduire notre empreinte carbone numérique.
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </Layout>
    );
}

