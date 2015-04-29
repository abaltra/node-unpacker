var fs = require('fs');
var uuid = require('node-uuid');
var unrar = require('unrar');
var tarball = require('tarball-extract');
var async = require('async');
var Q = require('q');
var zlib = require('zlib');
var p7zip = require('node-7z');

function extract7Zip (path, outpath, create_random_path, q) {
    fs.exists(outpath, function (exists) {
        if (exists) {
            outpath = create_random_path? outpath + uuid.v4() + '/' : outpath;
            var expander = new p7zip();
            expander.test(path)
                .then(function () {
                    expander.extractFull(path, outpath)
                        .then(function () {
                            q.resolve(outpath);
                        })
                        .catch(function (e) {
                            q.reject(e);
                        });
                })
                .catch(function (e) {
                    q.reject(e);
                });
        } else {
            q.reject('Output path doesn\'t exist');
        }
    });
};

function extractZip (path, outpath, create_random_path, q) {
    extract7Zip(path, outpath, createReadStream, q);
};

function extractTarGZ (path, outpath, create_random_path, q) {
    fs.exists(outpath, function (exists) {
        if (exists) {
            var uid = uuid.v4();
            outpath = create_random_path ? outpath + uid + '/' : outpath;
            if (create_random_path) {
                fs.mkdirSync(outpath);
            }
            try {
                tarball.extractTarball(path, outpath, function (err) {
                    if (err) return q.reject(err);
                    return q.resolve(outpath);    
                });
            } catch (err) {
                q.reject(err);
            }

        } else {
            q.reject('Output path doesn\'t exist');
        }
    });
};

function extractGZ (path, outpath, create_random_path, q) {
    var pieces = path.split('/');
    var out = pieces[pieces.length - 1].slice(0, pieces[pieces.length - 1].length - 3); // Single files with regular extension prior to .gz
    
    fs.exists(outpath, function (exists) {
        if (exists) {
            var uid = uuid.v4();
            outpath = create_random_path ? outpath + uid + '/' : outpath;
            if (create_random_path) {
                fs.mkdirSync(outpath);
            }
            fs.createReadStream(path)
                .pipe(zlib.createGzip()
                    .on('error', function (e) {
                        q.reject(e);
                    }))
                .pipe(fs.createWriteStream(outpath + out)
                    .on('finish', function (e) {
                        q.resolve(outpath);
                    })
                    .on('error', function (e) {
                        q.reject(e);
                    }));
        } else {
            q.reject('Output path doesn\'t exist');
        }
    });
};

function extractRar (path, outpath, create_random_path, q) {
    fs.exists(outpath, function (exists) {
        if (exists) {
            create_random_path = create_random_path ? true : false;
            var uid = uuid.v4();
            outpath = create_random_path? outpath + uid + '/' : outpath;
            var saved_routes = {};
            var dirs = [];
            var files = [];
            var archive = null;
            try {
                archive = new unrar(path);
            
                if (create_random_path) {
                    fs.mkdirSync(outpath);
                }
                archive.list(function (err, entries) {
                    if (err) {
                        return q.reject(err);
                    }
                    entries.forEach(function (entry) {
                        if (entry.type === 'Directory') {
                            var path_pieces = entry.name.split('/');
                            var saved_pieces = path_pieces[0];
                            saved_routes[saved_pieces] = true;
                            dirs.push(saved_pieces);
                            for (var i = 1; i < path_pieces.length; i++) {
                                saved_pieces += ('/' + path_pieces[i]);
                                if (saved_routes[saved_pieces]) continue;
                                else {
                                    saved_routes[saved_pieces] = true;
                                    dirs.push(saved_pieces);
                                }
                            }
                        } else {
                            files.push(entry);
                        }
                    });
                    dirs.sort(function (a, b) {
                        return a.split('/').length - b.split('/').length;
                    });

                    async.eachSeries(dirs, function (direntry, cb) {
                        fs.mkdir(outpath + direntry, function (err) {
                            cb(err);
                        });
                    }, function (err) {
                        if (err) {
                            return q.reject(err);
                        }
                        async.each(files, function (fileentry, cb) {
                            var stream = archive.stream(fileentry.name);
                            try {
                                stream.pipe(fs.createWriteStream(outpath + fileentry.name))
                                cb();
                            } catch (err) {
                                cb(err);
                            }
                        }, function (err) {
                            if (err) {
                                q.reject(err);
                            } else {
                                q.resolve(outpath);
                            }
                        });
                    });
                });
            } catch (err) {
                return q.reject(err);
            }
        } else {
            q.reject('Output path doesn\'t exist');
        }
    });
};

exports.unpackFile = function (path, outpath, create_random_path) {
    var deferred = Q.defer();
    if (!outpath) {
        deferred.reject('No output path given');
    } else {
        if (outpath[outpath.length - 1 ] !== '/') outpath += '/';
        async.series([
                function (cb) {
                    fs.exists(path, function (exists) {
                        if (exists) return cb();
                        else return cb('Input file not found');
                    })
                }, 
                function (cb) {
                    fs.access(outpath, fs.R_OK | fs.W_OK, function (err) {
                        if (err) return cb('Cannot write in output folder');
                        return cb();
                    })
                },
                function (cb) {
                    if( /(tar|tar\.gz|tgz)$/i.test(path)) {
                        extractTarGZ(path, outpath, create_random_path, deferred);
                    } else if (/(gz)$/i.test(path)) {
                        extractGZ(path, outpath, create_random_path, deferred);
                    } else if (/(zip)$/i.test(path)) {
                        extract7Zip(path, outpath, create_random_path, deferred);
                    } else if (/(rar)$/i.test(path)) {
                        extractRar(path, outpath, create_random_path, deferred);
                    } else if (/(7z|zipx)$/i.test(path)) {
                        extract7Zip(path, outpath, create_random_path, deferred);
                    } else {
                        return cb('File type not supported')
                    }
                    return cb();
                }
            ], function (err, results) {
                if (err) {
                    deferred.reject(err);
                }
            });
    }

    return deferred.promise;
};