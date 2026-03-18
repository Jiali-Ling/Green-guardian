import { useState, useEffect } from "react";
import * as mobilenet from "@tensorflow-models/mobilenet";
import * as tf from "@tensorflow/tfjs";

const MODEL_CONFIG = {
  version: 1,
  alpha: 0.25,
};

const MODEL_UNAVAILABLE_MESSAGE = "AI model unavailable. You can still take photos without AI recognition.";

async function loadModelWithBackend(backendName) {
  await tf.setBackend(backendName);
  await tf.ready();
  return mobilenet.load(MODEL_CONFIG);
}

function mapPredictions(predictions) {
  return predictions.map((prediction) => ({
    species: prediction.className,
    confidence: Math.round(prediction.probability * 100),
    scientificName: prediction.className,
  }));
}

export default function useSpeciesRecognition() {
  const [model, setModel] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadModel();
  }, []);

  const loadModel = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const loadedModel = await loadModelWithBackend("webgl");
      setModel(loadedModel);
    } catch (err) {
      try {
        const loadedModel = await loadModelWithBackend("cpu");
        setModel(loadedModel);
        setError(null);
      } catch (fallbackErr) {
        setError(MODEL_UNAVAILABLE_MESSAGE);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const classifyImage = async (imageElement) => {
    if (!model) {
      throw new Error("Model not loaded yet");
    }

    try {
      const predictions = await model.classify(imageElement);
      return mapPredictions(predictions);
    } catch (err) {
      throw new Error("Failed to classify image");
    }
  };

  return {
    model,
    isLoading,
    error,
    classifyImage,
    isReady: !!model && !isLoading,
  };
}
