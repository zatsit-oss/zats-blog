import { PATH_URL } from "../../path";
import XLogo from '@site/static/img/x.svg';
import LinkedinLogo from '@site/static/img/linkedin.svg';

const SocialsComponent = (article) => {
  const URL = `${PATH_URL.website}${article.articleUrl}`;

  return (
    <>
      <h2>Partager cet article :</h2>
      <a href={`${PATH_URL.socialShare.linkedin}${URL}`} target="_blank" style={{marginRight: "1rem"}}>
        <LinkedinLogo style={{ width: "2rem", height: "2rem"}} />
      </a>
      <a
        class="twitter-share-button"
        href={`${PATH_URL.socialShare.x}${URL}`}
        data-size="large"
        data-text="custom share text"
        data-url="https://dev.twitter.com/web/tweet-button"
        data-hashtags="zatsit_"
        data-via="zatsit_"
        data-related="twitterapi,twitter"
        target="_blank"
      >
        <XLogo title="Docusaurus Logo" className="logo" style={{ width: "2rem", height: "2rem"  }} alt="X social icon" />
      </a>
    </>
  );
};

export default SocialsComponent;
