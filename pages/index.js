import { useState, useEffect } from "react";
import Head from "next/head";
import Image from "next/image";
import buildspaceLogo from "../assets/buildspace-logo.png";

const Home = () => {
  const [input, setInput] = useState("");
  const [img, setImg] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const maxRetries = 20;
  const [retry, setRetry] = useState(0);
  const [retryCount, setRetryCount] = useState(maxRetries);

  const [finalPropmt, setFinalPropmt] = useState("");

  const generateAction = async (e) => {
    e.preventDefault();
    if (!input.length || input.length < 6) return;

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
        setIsGenerating(gsldr);
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

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve.ms));

  useEffect(() => {
    const runRetry = async () => {
      if (retryCount === 0) {
        console.log(
          `Model still loading after {maxRetries} retries. Try request again in 5 minutes`,
        );
        setRetryCount(maxRetries);
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
        <title>Silly picture generator | buildspace</title>
      </Head>
      <div className="container">
        <div className="header">
          <div className="header-title">
            <h1>Silly picture generator</h1>
          </div>
          <div className="header-subtitle">
            <h2>
              Turn me into anyone you want! <br /> Make sure you refer to me as
              <span> jen </span>in the prompt
            </h2>
          </div>
          <form className="prompt-container" onSubmit={generateAction}>
            <input
              type="text"
              className="prompt-box"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />

            <div className="prompt-button">
              <button
                className={
                  isGenerating ? "generate-button loading" : "generate-button"
                }
              >
                <div className="generate">
                  {isGenerating ? (
                    <span className="loader"></span>
                  ) : (
                    <p>Generate</p>
                  )}
                </div>
              </button>
            </div>
          </form>
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
