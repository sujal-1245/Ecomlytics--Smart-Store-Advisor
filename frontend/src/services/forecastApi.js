export const fetchForecast = async (daily) => {

  try {

    const res = await fetch(
      "http://localhost:5000/forecast",
      {

        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          daily
        })
      }
    );

    if (!res.ok) {

      throw new Error(
        "Forecast request failed"
      );
    }

    return await res.json();

  } catch (err) {

    console.error(
      "ML Forecast Error:",
      err
    );

    return null;
  }
};