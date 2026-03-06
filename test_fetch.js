const data = {
    vehicle_id: "demo_car_01",
    engine_runtime: 60,
    rpm: 4500,
    engine_load: 85,
    coolant_temp: 110,
    throttle_pos: 70,
    fuel_trim: 18,
    dtc_flag: true
};

fetch("http://localhost:5000/predict", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
})
    .then(res => {
        console.log("Status:", res.status);
        return res.text();
    })
    .then(text => console.log("Response:", text))
    .catch(err => console.error("Fetch Error:", err));
