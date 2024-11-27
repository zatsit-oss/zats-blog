import LinkedinLogo from "@site/static/img/linkedin.svg";
import XLogo from "@site/static/img/x.svg";
import { usePathUrlContext } from "../../context/pathContext";

const SocialsComponent = (article) => {
  const { website, socialShare } = usePathUrlContext();

  const URL = `${website}${article.articleUrl}`;

  return (
    <>
      <h2>Partager cet article :</h2>
      <a
        href={`${socialShare.linkedin}${URL}`}
        target="_blank"
        style={{ marginRight: "1rem" }}
      >
        <LinkedinLogo style={{ width: "2rem", height: "2rem" }} />
      </a>
      <a
        class="twitter-share-button"
        href={`${socialShare.x}${URL}`}
        data-size="large"
        data-text="custom share text"
        data-url="https://dev.twitter.com/web/tweet-button"
        data-hashtags="zatsit_"
        data-via="zatsit_"
        data-related="twitterapi,twitter"
        target="_blank"
      >
        <XLogo
          title="Docusaurus Logo"
          className="logo"
          style={{ width: "2rem", height: "2rem" }}
          alt="X social icon"
        />
      </a>
    </>
  );
};

export default SocialsComponent;
