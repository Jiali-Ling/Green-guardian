import { useState, useEffect, useRef } from "react";
import * as mobilenet from "@tensorflow-models/mobilenet";
import * as tf from "@tensorflow/tfjs";

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
      
      await tf.setBackend('webgl');
      await tf.ready();
      
      const loadedModel = await mobilenet.load({
        version: 1,
        alpha: 0.25,
      });
      
      setModel(loadedModel);
    } catch (err) {
      try {
        await tf.setBackend('cpu');
        await tf.ready();
        const loadedModel = await mobilenet.load({ version: 1, alpha: 0.25 });
        setModel(loadedModel);
        setError(null);
      } catch (fallbackErr) {
        setError("AI model unavailable. You can still take photos without AI recognition.");
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
      
      const results = predictions.map((pred) => ({
        species: pred.className,
        confidence: Math.round(pred.probability * 100),
        scientificName: pred.className,
      }));

      return results;
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
