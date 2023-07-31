import { PixelStreaming, Config, Logger, Flags } from '@epicgames-ps/lib-pixelstreamingfrontend-ue5.2';
import { SPSSignalling, MessageExtendedConfig } from './SignallingExtension';

// Example of how to set the logger level
Logger.SetLoggerVerbosity(10);

// Create a config object
const config = new Config({
	initialSettings: {
		AutoPlayVideo: false,
		AutoConnect: false,
		//ss: "ws://sps.tenant-tensorworks-demo.lga1.ingress.coreweave.cloud/car-config/ws",
		ss: "ws://localhost",
		StartVideoMuted: true,
		OfferToReceive: true, /* SPS works a lot better when browser sends offer still */
		TimeoutIfIdle: true,
		MaxReconnectAttempts: 0 /* We don't want reconnects on SPS */
	}
});

// Extend PixelStreaming to use our custom extended config that includes the engine version
class ScalablePixelStreaming extends PixelStreaming {
	// Create a new method that retains original functionality
	public handleOnConfig(messageExtendedConfig: MessageExtendedConfig) {
		this._webRtcController.handleOnConfigMessage(messageExtendedConfig);
	}
};

// Create a PixelStreaming instance and attach the video element to an existing parent div
const pixelStreaming = new ScalablePixelStreaming(config);

// Put pixelStreaming obj on the Window so we can access it puppeteer
declare global {
    interface Window { pixelStreaming: PixelStreaming; }
}
window.pixelStreaming = pixelStreaming;

document.body.onload = function() {
	console.log("Document loaded...");

	const signallingExtension = new SPSSignalling(pixelStreaming.webSocketController);
	signallingExtension.onAuthenticationResponse = (signallingResp: string, isError: boolean) => { document.getElementById("statusText").innerHTML = signallingResp };
	signallingExtension.onInstanceStateChanged = (signallingResp: string, isError: boolean) => { document.getElementById("statusText").innerHTML = signallingResp };

	// Override the onConfig so we can determine if we need to send the WebRTC offer based on what is sent from the signalling server
	pixelStreaming.webSocketController.onConfig = (messageExtendedConfig: MessageExtendedConfig) => {
		if(messageExtendedConfig.frontendToSendOffer){
			pixelStreaming.config.setFlagEnabled(Flags.BrowserSendOffer, messageExtendedConfig.frontendToSendOffer);
		}
		pixelStreaming.handleOnConfig(messageExtendedConfig);
	}

	let connectBtn = document.getElementById("connectBtn");
	connectBtn.addEventListener("click", ()=> {
		// Connect to the signaling server, this triggers the webrtc connection if everything is working
		pixelStreaming.connect();
		console.log("Attempting connect...");
	});

	// If browser denies autoplay, show "Click to play" and register a click-to-play handler
	pixelStreaming.addEventListener("playStreamRejected", () => {
		console.warn("Auto play of video stream rejected");
	})

	// Add an event to add the video element to the page
	pixelStreaming.addEventListener("videoInitialized", () => {
		console.log("Video initialized...");
		document.body.append(pixelStreaming.videoElementParent);
		pixelStreaming.play();
	});
}