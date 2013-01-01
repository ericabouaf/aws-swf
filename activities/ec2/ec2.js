
var AWS = require('aws-sdk');


function makeFct(name) {

   return function (task, config) {

      AWS.config.update({
         accessKeyId: config.accessKeyId,
         secretAccessKey: config.secretAccessKey,
         region: config.region
      });

      var params = JSON.parse(task.config.input);

      var svc = new AWS.EC2();

      svc.client[name](params, function (err, data) {
         if (err) {
            console.log(err); // an error occurred
            task.respondFailed('Error during the EC2 call', err);

         } else {
            // successful response
            // console.log( JSON.stringify(data, null, 3) );
            task.respondCompleted(data);
         }
      });

   };

}

[
   "activateLicense",
   "allocateAddress",
   "assignPrivateIpAddresses",
   "associateAddress",
   "associateDhcpOptions",
   "associateRouteTable",
   "attachInternetGateway",
   "attachNetworkInterface",
   "attachVolume",
   "attachVpnGateway",
   "authorizeSecurityGroupEgress",
   "authorizeSecurityGroupIngress",
   "bundleInstance",
   "cancelBundleTask",
   "cancelConversionTask",
   "cancelExportTask",
   "cancelReservedInstancesListing",
   "cancelSpotInstanceRequests",
   "confirmProductInstance",
   "createCustomerGateway",
   "createDhcpOptions",
   "createImage",
   "createInstanceExportTask",
   "createInternetGateway",
   "createKeyPair",
   "createNetworkAcl",
   "createNetworkAclEntry",
   "createNetworkInterface",
   "createPlacementGroup",
   "createReservedInstancesListing",
   "createRoute",
   "createRouteTable",
   "createSecurityGroup",
   "createSnapshot",
   "createSpotDatafeedSubscription",
   "createSubnet",
   "createTags",
   "createVolume",
   "createVpc",
   "createVpnConnection",
   "createVpnConnectionRoute",
   "createVpnGateway",
   "deactivateLicense",
   "deleteCustomerGateway",
   "deleteDhcpOptions",
   "deleteInternetGateway",
   "deleteKeyPair",
   "deleteNetworkAcl",
   "deleteNetworkAclEntry",
   "deleteNetworkInterface",
   "deletePlacementGroup",
   "deleteRoute",
   "deleteRouteTable",
   "deleteSecurityGroup",
   "deleteSnapshot",
   "deleteSpotDatafeedSubscription",
   "deleteSubnet",
   "deleteTags",
   "deleteVolume",
   "deleteVpc",
   "deleteVpnConnection",
   "deleteVpnConnectionRoute",
   "deleteVpnGateway",
   "deregisterImage",
   "describeAddresses",
   "describeAvailabilityZones",
   "describeBundleTasks",
   "describeConversionTasks",
   "describeCustomerGateways",
   "describeDhcpOptions",
   "describeExportTasks",
   "describeImageAttribute",
   "describeImages",
   "describeInstanceAttribute",
   "describeInstanceStatus",
   "describeInstances",
   "describeInternetGateways",
   "describeKeyPairs",
   "describeLicenses",
   "describeNetworkAcls",
   "describeNetworkInterfaceAttribute",
   "describeNetworkInterfaces",
   "describePlacementGroups",
   "describeRegions",
   "describeReservedInstances",
   "describeReservedInstancesListings",
   "describeReservedInstancesOfferings",
   "describeRouteTables",
   "describeSecurityGroups",
   "describeSnapshotAttribute",
   "describeSnapshots",
   "describeSpotDatafeedSubscription",
   "describeSpotInstanceRequests",
   "describeSpotPriceHistory",
   "describeSubnets",
   "describeTags",
   "describeVolumeAttribute",
   "describeVolumeStatus",
   "describeVolumes",
   "describeVpcs",
   "describeVpnConnections",
   "describeVpnGateways",
   "detachInternetGateway",
   "detachNetworkInterface",
   "detachVolume",
   "detachVpnGateway",
   "disableVgwRoutePropagation",
   "disassociateAddress",
   "disassociateRouteTable",
   "enableVgwRoutePropagation",
   "enableVolumeIO",
   "getConsoleOutput",
   "getPasswordData",
   "importInstance",
   "importKeyPair",
   "importVolume",
   "modifyImageAttribute",
   "modifyInstanceAttribute",
   "modifyNetworkInterfaceAttribute",
   "modifySnapshotAttribute",
   "modifyVolumeAttribute",
   "monitorInstances",
   "purchaseReservedInstancesOffering",
   "rebootInstances",
   "registerImage",
   "releaseAddress",
   "replaceNetworkAclAssociation",
   "replaceNetworkAclEntry",
   "replaceRoute",
   "replaceRouteTableAssociation",
   "reportInstanceStatus",
   "requestSpotInstances",
   "resetImageAttribute",
   "resetInstanceAttribute",
   "resetNetworkInterfaceAttribute",
   "resetSnapshotAttribute",
   "revokeSecurityGroupEgress",
   "revokeSecurityGroupIngress",
   "runInstances",
   "startInstances",
   "stopInstances",
   "terminateInstances",
   "unassignPrivateIpAddresses",
   "unmonitorInstances"
].forEach(function(n) {
   exports[n] = makeFct(n);
});
