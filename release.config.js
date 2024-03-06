module.exports = {
	branches: [
		"main",
		{
			name: "beta",
			prerelease: true
		}
	],
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
