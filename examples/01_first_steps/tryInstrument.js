import {sendToInflux} from './instrument.js'

try {
    // Calling your function with sample data
    await sendToInflux(
        "TestMeasure",  // measurement
        "MyFirstInstrumentation",         // action
        1,       // status
        10,             // metric
        "No error"       // errorMessage
    );
    
    console.log("✨ Test script finished.");
} catch (err) {
    console.error("💥 Script failed:", err);
}