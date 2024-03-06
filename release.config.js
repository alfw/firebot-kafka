module.exports = {
	plugins: [
		// additional config...
		"@semantic-release/release-notes-generator",
		[
			"@semantic-release/github",
			{
				assets: [{ path: "dist/alf-kafka.js", label: "alf-kafka.js" }]
			}
		]
	]
};
