module.exports = {
    publicPath: './',
    assetsDir: 'static',
    productionSourceMap: false,
    devServer: {
            port:4040,
            open: true,
        proxy: {
            '/api':{
                target:'http://localhost:8443',
                changeOrigin:true,
                pathRewrite:{
                    '/api':''
                }
            }
        }
    }
}