var soap = require('soap');
  var url = 'http://v3.core.com.productserve.com/ProductServeService.wsdl';
  var args = {sQuery: 'jeans'};
  soap.createClient(url, function(err, client) {
      console.log('client '+client);
      client.GetProductList(args, function(err, result) {
          console.log(result);
      });
  });