import { PATH_URL } from "../../path";

const SocialsComponent = (article) => {
  const URL = `${PATH_URL.website}${article.articleUrl}`;

  return (
    <>
      <h2>Partager cet article :</h2>
      <a href={`${PATH_URL.socialShare.linkedin}${URL}`} target="_blank" style={{paddingRight: "1rem"}}>
        <img
          src={require("../../static/img/icon-linkedin-72.png").default}
          style={{ widht: "2rem", height: "2rem" }}
          alt="Linkedin icon, share post on it"
        />
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
        <img
          src={require("../../static/img/icon-x-black.png").default}
          style={{ widht: "2rem", height: "2rem" }}
          alt="X social icon"
        />
      </a>
    </>
  );
};

export default SocialsComponent;
