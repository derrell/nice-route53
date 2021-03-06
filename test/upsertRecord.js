// ----------------------------------------------------------------------------

// npm
var test = require('tape');
var nock = require('nock');

// local
var Route53 = require('../nice-route53.js');

// ----------------------------------------------------------------------------

// create the mock server and client for Route53
var route53 = nock('https://route53.amazonaws.com');
var r53 = new Route53({
    accessKeyId     : 'xxx',
    secretAccessKey : 'xxx',
});

test('upsertRecord.js: upsertRecord()', function(t) {
    // firstly, mock the GetHostedZone
    route53
        .get('/2013-04-01/hostedzone/Z1PA6795UKMFR9')
        .replyWithFile(200, __dirname + '/GetHostedZoneResponse.xml')
    ;

    // then, mock the ListResourceRecordSetsResponse
    route53
        .get('/2013-04-01/hostedzone/Z1PA6795UKMFR9/rrset')
        .replyWithFile(200, __dirname + '/ListResourceRecordSetResponse-1.xml')
    ;

    // then, mock the ChangeResourceRecordSets
    route53
        .post('/2013-04-01/hostedzone/Z1PA6795UKMFR9/rrset/')
        .replyWithFile(200, __dirname + '/ChangeResourceRecordSetsResponse-1.xml')
    ;

    // upsert a record
    var args = {
        zoneId : 'Z1PA6795UKMFR9',
        name   : 'new.example.com.',
        type   : 'A',
        ttl    : 600,
    };
    r53.upsertRecord(args, function(err, changeInfo) {
        t.equal(err, null, 'There is no error');

        t.equal(changeInfo.changeId, 'C2682N5HXP0BZ4', 'changeId is correct');
        t.equal(changeInfo.status, 'PENDING', 'Change is PENDING');
        t.equal(changeInfo.submittedAt.toISOString(), '2012-10-09T06:12:42.058Z', 'SubmittedAt date is the same');

        t.end();
    });

});

// ----------------------------------------------------------------------------
