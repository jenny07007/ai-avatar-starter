import { useState, useEffect } from "react";
import Head from "next/head";
import Image from "next/image";
import buildspaceLogo from "../assets/buildspace-logo.png";

const Home = () => {
  const [input, setInput] = useState(
    "Protrait of jen in Batman, highly detailed digital painting, artstation, concept art, smooth, sharp focus, illustration, art by Bob Kane, Wailliam Klein and William Eggleston.",
  );
  const [img, setImg] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const maxRetries = 20;
  const [retry, setRetry] = useState(0);
  const [retryCount, setRetryCount] = useState(maxRetries);

  const [finalPropmt, setFinalPropmt] = useState("");

  const generateAction = async () => {
    if (!input.length || input.length < 6) return;
    if (isGenerating && retry === 0) return;

    console.log("Generating...");
    setIsGenerating(true);

    if (retry > 0) {
      setRetryCount((prevState) => (prevState === 0 ? 0 : prevState - 1));
      setRetry(0);
    }

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "image/jpeg",
        },
        body: JSON.stringify({ input }),
      });

      const data = await response.json();

      if (response.status === 503) {
        // console.log("Model is loading still :(");
        setRetry(data.estimated_time);
        return;
      }

      if (!response.ok) {
        console.log(`Error: ${data.error}`);
        setIsGenerating(false);
        return;
      }

      setFinalPropmt(input);
      setInput("");
      setImg(data.image);
      setIsGenerating(false);
    } catch (error) {
      setIsGenerating(false);
      console.log(error.message);
    }
  };

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  useEffect(() => {
    const runRetry = async () => {
      if (retryCount === 0) {
        console.log(
          `Model still loading after {maxRetries} retries. Try request again in 5 minutes`,
        );
        setRetryCount(maxRetries);
        setIsGenerating(false);
        return;
      }
      console.log(`Trying again in ${retry} seconds`);
      await sleep(retry * 1000);
      await generateAction();
    };

    if (retry === 0) {
      return;
    }
    runRetry();
  }, [retry]);

  return (
    <div className="root">
      <Head>
        <title>AI picture generator | buildspace</title>
      </Head>
      <div className="container">
        <div className="header">
          <div className="header-title">
            <h1>AI picture generator</h1>
          </div>
          <div className="header-subtitle">
            <h2>
              Turn me into anyone you want! <br /> Make sure you refer to me as
              <span> jen </span>in the prompt
            </h2>
          </div>
          <div className="prompt-container">
            <input
              type="text"
              className="prompt-box"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />

            <div className="prompt-buttons">
              <a
                className={
                  isGenerating ? "generate-button loading" : "generate-button"
                }
                onClick={generateAction}
              >
                <div className="generate">
                  {isGenerating ? (
                    <span className="loader"></span>
                  ) : (
                    <p>Generate</p>
                  )}
                </div>
              </a>
            </div>
          </div>
        </div>
        {img && (
          <div className="output-content">
            <Image src={img} width={512} height={512} alt={input} />
            <p>{finalPropmt}</p>
          </div>
        )}
      </div>

      <div className="badge-container grow">
        <a
          href="https://buildspace.so/builds/ai-avatar"
          target="_blank"
          rel="noreferrer"
        >
          <div className="badge">
            <Image src={buildspaceLogo} alt="buildspace logo" />
            <p>build with buildspace</p>
          </div>
        </a>
      </div>
    </div>
  );
};

export default Home;
