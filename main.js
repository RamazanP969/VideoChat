const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');
const toggleCameraButton = document.getElementById('toggleCameraButton');
const toggleMicrophoneButton = document.getElementById('toggleMicrophoneButton');
const volumeBar = document.getElementById('volumeBar');
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
let localStream;
let remoteStream;
let localStreamTracks;

startButton.addEventListener('click', async () => {
try {
localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
localVideo.srcObject = localStream;
localStreamTracks = localStream.getTracks();

const audioContext = new AudioContext();
const analyser = audioContext.createAnalyser();
const microphoneSource = audioContext.createMediaStreamSource(localStream);
microphoneSource.connect(analyser);

const data = new Uint8Array(analyser.frequencyBinCount);

const drawMeter = () => {
analyser.getByteFrequencyData(data);
const volume = data.reduce((a, b) => a + b, 0) / data.length;
volumeBar.style.width = `${volume}px`;
requestAnimationFrame(drawMeter);
};

drawMeter();

const configuration = {};

const peerConnection = new RTCPeerConnection(configuration);
localStreamTracks.forEach(track => peerConnection.addTrack(track, localStream));

peerConnection.ontrack = (event) => {
remoteStream = event.streams[0];
remoteVideo.srcObject = remoteStream;
};

const offer = await peerConnection.createOffer();
await peerConnection.setLocalDescription(offer);

startButton.style.display = "none";
stopButton.style.display = "inline-block";
toggleCameraButton.style.display = "inline-block";
toggleMicrophoneButton.style.display = "inline-block";

// Далее требуется обработка передачи SDP через сеть (сигналы и сессия)
} catch (error) {
console.error('Error starting video chat:', error);
}
});

stopButton.addEventListener('click', () => {
localStreamTracks.forEach(track => track.stop());
localVideo.srcObject = null;
remoteVideo.srcObject = null;
startButton.style.display = "inline-block";
stopButton.style.display = "none";
toggleCameraButton.style.display = "none";
toggleMicrophoneButton.style.display = "none";
volumeBar.style.width = "0";
});

toggleCameraButton.addEventListener('click', () => {
localStream.getVideoTracks()[0].enabled = !localStream.getVideoTracks()[0].enabled;
});

toggleMicrophoneButton.addEventListener('click', () => {
localStream.getAudioTracks()[0].enabled = !localStream.getAudioTracks()[0].enabled;
});

