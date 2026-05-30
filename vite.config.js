export default {
    base: './',
    server: {
        'allowedHosts' : ['srv833678.hstgr.cloud', 'marcorobo.space', 'www.marcorobo.space', 'debug.marcorobo.space']
    },
    optimizeDeps: {
        exclude: [
            "@babylonjs/core",
            "@babylonjs/loaders",
            "@babylonjs/gui"
        ]
    }
}