function marketOrder(api, side, orderQty, test){
    var path = "/api/v1/order";
    var params = {"symbol": "XBTUSD", "side": side, "orderQty": orderQty, "ordType": "Market"};
    var order = sendRequest(api, params, "POST", path, 0, test)
    return order
}

function marketCloseOrder(api, test){
    var path = "/api/v1/order/closePosition"
    var params = {"symbol": "XBTUSD"}
    return sendRequest(api, params, "POST", path, 0, test)
}

function getPosition(api, test){
    var path = "/api/v1/position"
    var params = {"symbol": "XBTUSD"}
    var position = sendRequest(api, params, "GET", path, 0, test)
    return position
}

function marketStopOrder(api, side, pegOffsetValue, pegPriceType, orderQty, test){
    var path = "/api/v1/order"
    var params = {"symbol": "XBTUSD", "side": side, "pegOffsetValue": pegOffsetValue, "orderQty": orderQty, "pegPriceType": pegPriceType}
    var position = sendRequest(api, params, "POST", path, 0, test)
    return position
}
    

function sendRequest(api, params, method, path, numResend, test){
    if (numResend > 10){throw "Too much resend request exception, make sure something problem"}
    var api_url = "";
    if(test=="test"){  
        api_url = "https://testnet.bitmex.com";
    }else if(test=="main"){
        api_url = "https://www.bitmex.com";
    }
    var path = path;
    d = new Date()
    var nonce = d.getTime().toString()
    var option = {
        "headers": {
        "Content-Type": "application/json", 
        'api-nonce': nonce,
        "api-key": api.apiKey, 
        },
        "method": method, 
        "muteHttpExceptions": true
    }
    if(method=="POST"){
        var payload = params
        var signature = makeSignature(api.apiSecret, method, nonce, path, payload);
        option["headers"]["api-signature"] = signature
        option["payload"] = JSON.stringify(payload)
        var query = path
    }else if(method=="GET"){
        var query = path
        query = path + "?filter=" + encodeURIComponent(JSON.stringify(params))
        var payload = ''
        var signature = makeSignature(api.apiSecret, method, nonce, query, payload)
        option["headers"]["api-signature"] = signature
    }
    var response = UrlFetchApp.fetch(api_url+query, option)
    if(checkHttpError(response) == "Resend"){
        if(numResend < 10){
            sleep(500)
            sendRequest(api, params, method, path, numResend + 1, test)
        }
    }
    return response
}

function checkHttpError(response){
    res = JSON.parse(response)
    code = response.getResponseCode()
    if(code > 400){
        if(code == 503){
            return "Resend"
        }else{
            throw new HTTPException(res["error"]["message"], "HTTPCode" + code + ":" + res["error"]["name"])
        }
    }
}

function HTTPException(message, name){
    this.message = message
    this.name = name
  }
