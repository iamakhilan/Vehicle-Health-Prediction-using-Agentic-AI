const data = {
    vehicle_id: "demo_car_01",
    engine_runtime: 60,
    rpm: 4500,
    oil_pressure: 3.5,
    fuel_pressure: 6.0,
    coolant_pressure: 2.5,
    oil_temp: 95,
    coolant_temperature: 110,
    engine_load: 85,
    coolant_temp: 110,
    throttle_pos: 70,
    fuel_trim: 18,
    dtc_flag: true,
    source_row_index: 42
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
