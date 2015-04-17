var assert = require('assert');
var inflator = require('../inflator.js');
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var expect = chai.expect;
var fs = require('fs.extra')
var async = require('async');

describe('Failed unpacks', function () {

    beforeEach(function (done) {
        fs.mkdir('test/inflated', function (err) {
            done();
        });
    })

    afterEach(function (done) {
        fs.rmrf('test/inflated', function (err) {
            done();
        });
    });

    it('should fail on non existant file', function () {
        return inflator.unpackFile('non_existant_file', 'test/inflated/', true).then(
            function (data) {},
            function (err) {
                expect(err).to.exist;
                expect(err).to.equal('Input file not found')
            });
    });

    it('should fail on unknow extension', function () {
        return inflator.unpackFile('test/files/test.png', 'test/inflated/', true).then(
            function (data) {},
            function (err) {
                expect(err).to.exist;
                expect(err).to.equal('File type not supported');
            });
    });

    it('should fail on missing output path', function () {
        return inflator.unpackFile('test/files/zipped_files.zip', null, true).then(
            function (data) {},
            function (err) {
                expect(err).to.exist;
                expect(err).to.equal('No output path given');
            })
    });

    it('should fail without proper permissions', function () {
        return inflator.unpackFile('test/files/zipped_files.zip', '/root/', true).then(
            function (data) {
            },
            function (err) {
                expect(err).to.exist;
                expect(err).to.equal('Cannot write in output folder');
            });
    });


    it('should fail on corrupted ZIP file', function () {
        return inflator.unpackFile('test/files/corrupted.zip', 'test/inflated', true).then(
            function (data) {},
            function (err) {
                expect(err).to.exist;
            });
    });


    it('should fail on corrupted RAR file', function () {
        return inflator.unpackFile('test/files/corrupted.rar', 'test/inflated', true).then(
            function (data) {},
            function (err) {
                expect(err).to.exist;
            });
    });
  
    it('should fail on corrupted TAR.GZ file', function () {
        return inflator.unpackFile('test/files/corrupted.tar.gz', 'test/inflated', true).then(
            function (data) {},
            function (err) {
                expect(err).to.exist;
            });
    });

    it('should fail on corrupted TAR file', function () {
        return inflator.unpackFile('test/files/corrupted.tar', 'test/inflated', true).then(
            function (data) {},
            function (err) {
                expect(err).to.exist;
            });
    })  
});

describe('Working unpacks', function () {

    beforeEach(function (done) {
        fs.mkdir('test/inflated', function (err) {
            done();
        });
    })

    afterEach(function (done) {
        fs.rmrf('test/inflated', function (err) {
            done();
        });
    });

    it('Unpack MACOSX packed ZIP file', function (done) {
        return inflator.unpackFile('test/files/zip-small.zip', 'test/inflated/', true).then(
            function (data) {
                expect(data).to.exist;

                fs.readdir(data, function (err, files) {
                    expect(files.length).to.equal(6);
                    done();
                });
            },
            function (err) {}   
        );
    });

    it('Unpack ZIP file', function (done) {
        return inflator.unpackFile('test/files/zipped_files.zip', 'test/inflated/', true).then(
            function (data) {
                expect(data).to.exist;

                async.waterfall([
                    function (callback) {
                        fs.readdir(data, function (err, files) {
                            expect(files.length).to.equal(1);
                            callback(null, files[0]);
                        })
                    },
                    function (file, callback) {
                        fs.stat(data + '/' + file, function (err, stats) {
                            expect(stats.isDirectory()).to.equal(true);
                            callback(null, data + file);
                        });
                    },
                    function (path, callback) {
                        fs.readdir(path, function (err, files) {
                            expect(files.length).to.equal(5);
                            callback(null, files, path);
                        })
                    },
                    function (files, path, callback) {
                        var dirs = [];
                        var _files = [];

                        async.eachSeries(files, 
                            function (file, cb) {
                                fs.stat(path + '/' + file, function (error, stat) {
                                    if (stat.isDirectory()) dirs.push(path + '/' + file);
                                    else _files.push(path + '/' + file);
                                    cb();
                                });
                            }, function (err) {
                                expect(dirs.length).to.equal(1);
                                expect(_files.length).to.equal(4);
                                callback(null, dirs[0]);
                            })
                    },
                    function (dir, callback) {
                        fs.readdir(dir, function (err, files) {
                            expect(files.length).to.equal(1);
                            callback();
                        });
                    }], function (err, results){
                        done();
                    }
                );       
            },
            function (err) {});
    });

    it('Unpack 7Z file', function (done) {
        return inflator.unpackFile('test/files/7zipped.7z', 'test/inflated/', true).then(
            function (data) {
                expect(data).to.exist;

                async.waterfall([
                    function (callback) {
                        fs.readdir(data, function (err, files) {
                            expect(files.length).to.equal(1);
                            callback(null, files[0]);
                        })
                    },
                    function (file, callback) {
                        fs.stat(data + '/' + file, function (err, stats) {
                            expect(stats.isDirectory()).to.equal(true);
                            callback(null, data + file);
                        });
                    },
                    function (path, callback) {
                        fs.readdir(path, function (err, files) {
                            expect(files.length).to.equal(5);
                            callback(null, files, path);
                        })
                    },
                    function (files, path, callback) {
                        var dirs = [];
                        var _files = [];

                        async.eachSeries(files, 
                            function (file, cb) {
                                fs.stat(path + '/' + file, function (error, stat) {
                                    if (stat.isDirectory()) dirs.push(path + '/' + file);
                                    else _files.push(path + '/' + file);
                                    cb();
                                });
                            }, function (err) {
                                expect(dirs.length).to.equal(1);
                                expect(_files.length).to.equal(4);
                                callback(null, dirs[0]);
                            })
                    },
                    function (dir, callback) {
                        fs.readdir(dir, function (err, files) {
                            expect(files.length).to.equal(1);
                            callback();
                        });
                    }], function (err, results){
                        done();
                    }
                );       
            },
            function (err) {});
    });

    it('Unpack RAR file', function (done) {
        return inflator.unpackFile('test/files/rared_files.rar', 'test/inflated/', true).then(
            function (data) {
                expect(data).to.exist;

                async.waterfall([
                    function (callback) {
                        fs.readdir(data, function (err, files) {
                            expect(files.length).to.equal(1);
                            callback(null, files[0]);
                        })
                    },
                    function (file, callback) {
                        fs.stat(data + '/' + file, function (err, stats) {
                            expect(stats.isDirectory()).to.equal(true);
                            callback(null, data + file);
                        });
                    },
                    function (path, callback) {
                        fs.readdir(path, function (err, files) {
                            expect(files.length).to.equal(5);
                            callback(null, files, path);
                        })
                    },
                    function (files, path, callback) {
                        var dirs = [];
                        var _files = [];

                        async.eachSeries(files, 
                            function (file, cb) {
                                fs.stat(path + '/' + file, function (error, stat) {
                                    if (stat.isDirectory()) dirs.push(path + '/' + file);
                                    else _files.push(path + '/' + file);
                                    cb();
                                });
                            }, function (err) {
                                expect(dirs.length).to.equal(1);
                                expect(_files.length).to.equal(4);
                                callback(null, dirs[0]);
                            })
                    },
                    function (dir, callback) {
                        fs.readdir(dir, function (err, files) {
                            expect(files.length).to.equal(1);
                            callback();
                        });
                    }], function (err, results){
                        done();
                    }
                );       
            },
            function (err) {});
    });

    it('Inflate GZ file', function (done) {
        return inflator.unpackFile('test/files/gzed.png.gz', 'test/inflated/', true).then(
            function (data) {
                expect(data).to.exist;
                fs.readdir(data, function (err, files) {
                    expect(files.length).to.equal(1);
                    expect(files[0]).to.equal('gzed.png');
                    done();
                });
            },
            function (err) {}
        );
    });

    it('Unpack TAR file', function (done) {
        return inflator.unpackFile('test/files/tared_files.tar', 'test/inflated/', true).then(
            function (data) {
                expect(data).to.exist;

                async.waterfall([
                    function (callback) {
                        fs.readdir(data, function (err, files) {
                            expect(files.length).to.equal(1);
                            callback(null, files[0]);
                        })
                    },
                    function (file, callback) {
                        fs.stat(data + '/' + file, function (err, stats) {
                            expect(stats.isDirectory()).to.equal(true);
                            callback(null, data + file);
                        });
                    },
                    function (path, callback) {
                        fs.readdir(path, function (err, files) {
                            expect(files.length).to.equal(5);
                            callback(null, files, path);
                        })
                    },
                    function (files, path, callback) {
                        var dirs = [];
                        var _files = [];

                        async.eachSeries(files, 
                            function (file, cb) {
                                fs.stat(path + '/' + file, function (error, stat) {
                                    if (stat.isDirectory()) dirs.push(path + '/' + file);
                                    else _files.push(path + '/' + file);
                                    cb();
                                });
                            }, function (err) {
                                expect(dirs.length).to.equal(1);
                                expect(_files.length).to.equal(4);
                                callback(null, dirs[0]);
                            })
                    },
                    function (dir, callback) {
                        fs.readdir(dir, function (err, files) {
                            expect(files.length).to.equal(1);
                            callback();
                        });
                    }], function (err, results){
                        done();
                    }
                );       
            },
            function (err) {});
    });

    it('Unpack TAR.GZ file', function (done) {
        return inflator.unpackFile('test/files/tar_gzd_files.tar.gz', 'test/inflated/', true).then(
            function (data) {
                expect(data).to.exist;

                async.waterfall([
                    function (callback) {
                        fs.readdir(data, function (err, files) {
                            expect(files.length).to.equal(1);
                            callback(null, files[0]);
                        })
                    },
                    function (file, callback) {
                        fs.stat(data + '/' + file, function (err, stats) {
                            expect(stats.isDirectory()).to.equal(true);
                            callback(null, data + file);
                        });
                    },
                    function (path, callback) {
                        fs.readdir(path, function (err, files) {
                            expect(files.length).to.equal(5);
                            callback(null, files, path);
                        })
                    },
                    function (files, path, callback) {
                        var dirs = [];
                        var _files = [];

                        async.eachSeries(files, 
                            function (file, cb) {
                                fs.stat(path + '/' + file, function (error, stat) {
                                    if (stat.isDirectory()) dirs.push(path + '/' + file);
                                    else _files.push(path + '/' + file);
                                    cb();
                                });
                            }, function (err) {
                                expect(dirs.length).to.equal(1);
                                expect(_files.length).to.equal(4);
                                callback(null, dirs[0]);
                            })
                    },
                    function (dir, callback) {
                        fs.readdir(dir, function (err, files) {
                            expect(files.length).to.equal(1);
                            callback();
                        });
                    }], function (err, results){
                        done();
                    }
                );       
            },
            function (err) {});
    });
});


