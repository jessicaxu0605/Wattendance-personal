import express from 'express';
import mysql from 'mysql';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import cors from 'cors';
import cron from 'node-cron';

const app = express();
app.use(express.json());
app.use(cors({
    origin: '*',
}));
const port = 3600;
dotenv.config();
const pool = mysql.createPool({
    connectionLimit: 10,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    authPlugin: 'mysql_native_password'
});

//-----------------------------------------
//User login management

app.post("/signup", async(req,res) => {
    console.log("\nENDPOINT:/signup")
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const hashedPW = await bcrypt.hash(req.body.password, 10); //stores hashed password
    const email = req.body.email;

    const find_user_query = mysql.format("SELECT email FROM users WHERE email = ? LIMIT 1", [email]);
    const insert_query = mysql.format ("INSERT INTO users VALUES (0, ?, ?, ?, ?)", [firstName, lastName, email, hashedPW]);


    pool.getConnection(async(err, connection)=>{
        if (err) {
            res.status(500).send({'error':'internal server error'});
            throw(err);
        } else {
            await connection.query(find_user_query, async(err, result)=>{
                if (err) {
                    connection.release();
                    res.status(500).send({'error':'internal server error'});
                    throw(err);
                } else {
                    if (result.length > 0) {
                        connection.release();
                        console.log("account already exists for email")
                        res.status(409).send({
                            // 'status': 'unsuccessful',
                            'error': 'existing user'
                        });
                    } else {
                        await connection.query(insert_query,
                            async (err, result) => {
                                connection.release();
                                if (err) throw (err);
                                else {const id = result.insertId;
                                res.send({
                                    // 'status': 'successful',
                                    'user': {
                                        'id': id,
                                        'firstName': firstName,
                                        'lastName': lastName,
                                        'email': email,
                                    }
                                });}
                            }
                        )
                    }
                } 
            })
        }
    })
});

app.put("/login", async(req,res) => {
    console.log("\nENDPOINT:/login")
    const email = req.body.email;
    const password = req.body.password;

    const find_user_query = mysql.format("SELECT * FROM users WHERE email = ? LIMIT 1", [email]);

    pool.getConnection(async(err, connection)=>{
        if (err) {
            res.status(500).send({'error':'internal server error'});
            throw(err);
        } else {
            await connection.query(find_user_query, async(err, result)=>{
                if (err) {
                    connection.release();
                    res.status(500).send({'error':'internal server error'});
                    throw(err);
                } else {
                    if (result.length > 0) {
                        connection.release();
                        const hashedPW = result[0].password
                        if (await bcrypt.compare(password, hashedPW)) {
                            res.send({
                                'user': {
                                    'id': result[0].idusers,
                                    'firstName': result[0].firstName,
                                    'lastName': result[0].lastName,
                                    'email': result[0].email,
                                }
                            });
                        } else {
                            console.log("password incorrect");
                            res.status(401).send(JSON.stringify({
                                'error': 'password incorrect'
                            }))
                        }
                    } else {
                        console.log("user does not exist");
                            res.status(404).send(JSON.stringify({
                                'error': 'no user',
                            }));
                    }
                } 
            })
        }
    })
});



//-----------------------------------------
//data fetching

//get attendance/date pair per user--used by github-style display on front-end
app.get("/attendance-batched/:userID", async(req,res) => {
    console.log("\nENDPOINT:/attendance-batched");
    const userID = req.params.userID;

    const find_attendance = mysql.format(
        "SELECT DATE(datetime) AS `date`, classID FROM attendance\
         WHERE userID = ? AND NOT attendanceStatus = 3\
         ORDER BY `date`",
        [userID]
    );
    pool.getConnection(async(err, connection)=> {
        if (err) {
            res.sendStatus(500);
            throw (err);
        }
        try{
            await connection.query(find_attendance,
            async(err, result)=> {
                const attendance = [];
                if (result.length == 0) {
                    res.send(attendance);
                } else {
                    let curDate = result[0].date.getTime();
                    let count = 1;
                    let i = 1;
                    while (i < result.length) {

                        if (result[i].date.getTime() != curDate) {
                            attendance.push({'date': curDate, 'count': count})
                            curDate = result[i].date.getTime();
                            count = 0;
                        }
                        count++;
                        i++;
                    }
                    attendance.push({'date': curDate, 'count': count});
                    res.send(attendance)
                }
            });
        } catch (err) {
            res.sendStatus(500);
            throw (err);
        } finally {
            connection.release();
        }
    });
})

//get
app.get("/course-attendance/:courseID", async(req,res) => {
    console.log("\nENDPOINT:/course-attendance");
    const courseID = req.params.courseID;
    const find_attendance = mysql.format(
        "SELECT courseName, courseCode, totalAttendance FROM courses WHERE idcourses = ? LIMIT 1",
        [courseID]
    );
    pool.getConnection(async(err, connection)=> {
        if (err) {
            res.sendStatus(500);
            throw (err);
        }
        try{
            await connection.query(find_attendance,
            async(err, result)=> {
                res.send({
                    'course': result[0].courseName,
                    'code': result[0].courseCode,
                    'attendance': result[0].totalAttendance
                })
            });
        } catch (err) {
            res.sendStatus(500);
            throw (err);
        } finally {
            connection.release();
        }
    });
})



app.get("/scatter-points", async(req,res) => {
    console.log("\nENDPOINT:/scatter-points");

    function getCourses() {
        const find_courses = mysql.format("SELECT idcourses, courseCode FROM courses");
        return new Promise((resolve, reject)=>{
            pool.getConnection((err, connection)=>{
                if (err) {
                    res.sendStatus(500);
                    connection.release();
                    reject (err);
                } else {
                    connection.query(find_courses, (err, result)=>{
                        connection.release();
                        if (err) {
                            res.sendStatus(500);
                            reject (err);
                        } else {
                            resolve(result);
                        }
                    });
                }
            })
        })
    }

    function getCoursePoints(courseID) {
        const get_all_attendance = mysql.format(
            "SELECT sr.`avg` AS average, sr.userID\
            FROM `courses-users` cu\
            LEFT JOIN `survey-results` sr ON sr.userID = cu.userID\
            LEFT JOIN attendance a ON a.userID = cu.userID\
            JOIN classes c ON c.idclasses = a.classID\
            WHERE cu.courseID = ? AND sr.courseID = ? AND c.courseID = ? AND NOT a.attendanceStatus =3\
            ORDER BY cu.userID",
            [courseID, courseID, courseID]
        );
        
        return new Promise((resolve, reject)=>{
            pool.getConnection((err, connection)=>{
                if (err) {
                    res.sendStatus(500);
                    connection.release();
                    reject (err);
                } else {
                    connection.query(get_all_attendance, (err, result)=> {
                        connection.release();
                        if (err) {
                            res.sendStatus(500);
                            reject (err);
                        } else {
                            const attendance = [];
                            if (result.length > 0) {                
                                let curUser = result[0].userID;
                                let count = 1;
                                let i = 1;
                                while (i < result.length) {
                                    if (result[i].userID != curUser) {
                                        attendance.push({
                                            'y':result[i].average,
                                            'x': count,
                                            'id':i
                                        })
                                        curUser = result[i].userID;
                                        count = 0;
                                    }
                                    count++;
                                    i++;
                                }
                                attendance.push({
                                    'y': result[i-1].average,
                                    'x': count,
                                    'id':i
                                })
                                //console.log(attendance)
                            }
                            resolve(attendance);
                        }
                    });                    
                }
            })
        })
    }

    try{
        const courses = await getCourses();
        const points = [];

        for (let i = 0; i < courses.length; i++) {
            const point = await getCoursePoints(courses[i].idcourses);
            points.push({'point':point, 'code':courses[i].courseCode});
        }
        res.send({'points':points});

    } catch (err) {
        throw (err);
    }
})



app.get("/overall-attendance", async(req,res) => {
    console.log("\nENDPOINT:/overall-attendance");

    const courseID = req.query.courseID;
    const userID = req.query.userID;

    const get_course_info = mysql.format(
        "SELECT courseName, courseCode FROM courses\
        WHERE idcourses = ? LIMIT 1",
        [courseID]
    );
    function getCourseInfo() {
        return new Promise((resolve, reject) => {
            pool.getConnection((err, connection) => {
                if (err) {
                    res.sendStatus(500);
                    connection.release();
                    reject(err);
                } else {
                    connection.query(get_course_info, (err, result) => {
                        connection.release();
                        if (err) {
                            res.sendStatus(500);
                            reject(err);
                        } else {
                            resolve(result);
                        }
                    });
                }
            });
        });
    }
    try{
        const course_info = await getCourseInfo();

        const get_course_attendance = mysql.format(
            "SELECT c.courseID FROM attendance a\
            JOIN classes c ON c.idclasses = a.classID\
            WHERE c.courseID = ? AND a.userID = ? AND NOT a.attendanceStatus = 3",
            [courseID, userID]
        );
        pool.getConnection(async(err, connection) => {
            connection.release();

            await connection.query(get_course_attendance,
                async(err, result)=> {
                    const length = result.length;
                    const { courseName, courseCode } = course_info[0];
                    res.send({
                        'course': courseName,
                        'code': courseCode,
                        'attendance': length,
                    })
                });
        });
    } catch (err) {
        res.sendStatus(500);
        throw (err);
    }
    
})

app.get("/enrolled-courses/:userID", async(req,res) => {
    console.log("\nENDPOINT:/enrolled-courses");
    const userID = req.params.userID;
    
    const find_courses = mysql.format(
        "SELECT idcourses, courseName, courseCode FROM courses c\
        JOIN `courses-users` cu ON cu.courseID = c.idcourses\
        WHERE cu.userID = ?",
        [userID]
    )

    pool.getConnection(async(err, connection)=> {
        await connection.query(find_courses, 
            async(err, result)=> {
            
            res.send(result);
        });
    });
});

app.post("/survey-result", async(req,res) => {
    console.log("\nENDPOINT:/survey-result");
    const userID = req.body.userID;
    const courseID = req.body.courseID;
    const q1 = req.body.q1;
    const q2 = req.body.q2;
    const q3 = req.body.q3;
    const q4 = req.body.q4;
    
    const find_query = mysql.format("SELECT userID FROM `survey-results` \
        WHERE userID = ? AND courseID = ? LIMIT 1", 
        [userID, courseID]);

    const insert_query = mysql.format ("INSERT INTO `survey-results` \
        (userID, courseID, q1, q2, q3, q4) VALUES (?, ?, ?, ?, ?, ?)", 
        [userID, courseID, q1, q2, q3, q4]);

    const update_query = mysql.format("UPDATE `survey-results` \
        SET q1 = ?, q2 = ?, q3 = ?, q4 = ?\
        WHERE userID = ? AND courseID = ?",
        [q1, q2, q3, q4, userID, courseID]);

        pool.getConnection(async(err, connection)=> {
            if (err) {
                res.sendStatus(500);
                throw (err);
            }
            try{
                await connection.query(find_query,
                async(err, result)=> {
                    if (result.length > 0) {
                        await connection.query(update_query);
                        console.log("updated");
                    } else {
                        await connection.query(insert_query);
                        console.log("inserted");
                    }
                });
            } catch (err) {
                res.sendStatus(500);
                throw (err);
            } finally {
                connection.release();
            }
    });
});



//-----------------------------------------
//Attendence recording

//This endpoint is hit by the raspberry pi every time it detects a known person
//Handles logic for if the person is late or on time
app.post("/attendance-present", async(req,res) => {
    console.log("\nENDPOINT:/attendance-present")
    const userID = req.body.user;

    const datetime = new Date();
    const sqlDatetime= datetime.toISOString().slice(0, 19).replace('T', ' ');

    //check if there is an UPCOMING class that the detected user is enrolled in
    const find_present_class = mysql.format(
        "SELECT cl.idclasses, cl.courseID \
        FROM users u \
        JOIN `courses-users` cu ON cu.userID = u.idusers \
        JOIN classes cl ON cl.courseID = cu.courseID \
        WHERE TIMESTAMPDIFF(MINUTE, ?, cl.startTime) BETWEEN -1 AND 15 \
        LIMIT 1;",
        [sqlDatetime]);
    //check if there is an ONGOING class that the detected user is enrolled in
    const find_late_class = mysql.format(
        "SELECT cl.idclasses, cl.courseID \
        FROM users u \
        JOIN `courses-users` cu ON cu.userID = u.idusers \
        JOIN classes cl ON cl.courseID = cu.courseID \
        WHERE '2023-11-25 03:03:11' > cl.startTime AND '2023-11-25 03:03:11' < cl.endTime \
        LIMIT 1;",
        [sqlDatetime, sqlDatetime]);

    pool.getConnection(async(err, connection)=> {
        if (err) {
            res.status(500).send({'error':'internal server error'});
            throw(err);
        } 
        try{
            await connection.query(find_present_class, async(err, result)=> {
                //if present class found:
                if (result.length > 0) {
                    const classID = result[0].idclasses;
                    const insert_query = mysql.format(
                        "INSERT INTO attendance (`classID`, `userID`, `attendanceStatus`, `datetime`) VALUES (?, ?, 0, ?)", 
                        [classID, userID, sqlDatetime]);
                    await connection.query(insert_query);
                    const courseID = result[0].courseID;
                    const update_course = mysql.format(
                        "UPDATE courses SET totalAttendance = totalAttendance + 1 WHERE idcourses = ?",
                        [courseID]
                    )
                    await connection.query(update_course);
                    console.log("present attendance recorded");
                //no present class found; search for late classes:
                } else {
                    await connection.query(find_late_class,
                        async(err, lateResult)=> {
                            if (lateResult.length > 0) {
                                const classID = lateResult[0].idclasses;
                                const insert_query = mysql.format(
                                    "INSERT INTO attendance (`classID`, `userID`, `attendanceStatus`, `datetime`) VALUES (?, ?, 1, ?)", 
                                    [classID, userID, sqlDatetime]);
                                await connection.query(insert_query);
                                const courseID = lateResult[0].courseID;
                                const update_course = mysql.format(
                                    "UPDATE courses SET totalAttendance = totalAttendance + 1 WHERE idcourses = ?",
                                    [courseID]
                                )
                                await connection.query(update_course);
                                console.log("late attendance recorded");
                            } else {
                                console.log("no valid classes found");
                            }
                        }
                    );
                }
            });
        } catch (err) {
            res.sendStatus(500);
            throw (err);
        } finally {
            res.send("attendance recorded");
            connection.release();
        }
    });
})

//cron automated to hit this endpoint every time a scheduled class ends
app.post("/attendance-absent", async(req,res) => {
    console.log("\nENDPOINT:/attendance-absent")
    const classID = req.body.class;

    //get the courseID of the class
    function getCourseID(query) {
        return new Promise((resolve, reject) => {
            pool.getConnection((err, connection) => {
                if (err) {
                    connection.release();
                    res.sendStatus(500);
                    reject(err);
                } else {
                    connection.query(query, (err, result) => {
                        connection.release();
                        if (err) {
                            res.sendStatus(500);
                            reject(err);
                        } else {
                            resolve(result);
                        }
                    });
                }
            });
        });
    }
    const find_courseID_query = mysql.format("SELECT courseID FROM classes WHERE idclasses = ? LIMIT 1", [classID]);
    
    //mark all users not marked late or present as absent
    try {
        const courses = await getCourseID(find_courseID_query);
        const courseID = courses[0].courseID;
        const find_absent = mysql.format(
            "SELECT userID FROM `courses-users` WHERE courseID = ?\
            AND userID NOT IN (SELECT userID FROM attendance WHERE classID = ?)",
            [courseID, classID]);
        const absent = await get(find_absent);
        pool.getConnection(async(err, connection)=>{
            for (let user in absent) {
                const userID = absent[user].userID;
                const insert_query = mysql.format(
                    "INSERT INTO attendance (`classID`, `userID`, `attendanceStatus`, `datetime`) VALUES (?, ?, 2, NULL)", 
                    [classID, userID]);
                await connection.query(insert_query);
            }
        })
        res.sendStatus(200);
    } catch (err) {
        res.sendStatus(500);
        throw (err);
    }
});

//scheduled calls for recording absences:
const absence = async(classID, time)=> {
    cron.schedule(time, async () => {
        try {
            const options = {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    'class':classID
                }),
            }
            const response = fetch('http://18.223.107.181:3600/attendance-absent', options);
        } catch (err) {
            res.sendStatus(500);
            throw (err)
        }
    });
}


// Not including tutorials or labs

// Monday
absence(2, '20 9 * * 1'); // math 115 - 9:20
absence(6, '20 10 * * 1'); // se 101 - 10:20
absence(4, '20 11 * * 1'); // math 117 - 11:20
absence(5, '20 14 * * 1'); // math 135 - 2:20

// Tuesday
absence(1, '50 9 * * 2'); // ece 105 - 9:50
absence(3, '20 11 * * 2'); // cs 137 - 11:20

// Wednesday
absence(2, '20 10 * * 3'); // math 115 - 10:20
absence(4, '20 11 * * 3'); // math 117 - 11:20
absence(6, '20 13 * * 3'); // se 101 - 1:20
absence(5, '20 14 * * 3'); // math 135 - 2:20

// Thursday
absence(1, '50 9 * * 4'); // ece 105 - 9:50
absence(3, '20 11 * * 4'); // cs 137 - 11:20
absence(2, '20 14 * * 4'); // math 115 - 2:20

// Friday
absence(4, '20 11 * * 5'); // math 117 - 11:20
absence(5, '20 14 * * 5'); // math 135 - 2:20

app.get("/artificial-attendance", async(req,res) => {


    pool.getConnection(async(err, connection)=> {
        connection.release();
        for (let i = 5; i < (200); i++) {
            
            const rand = Math.floor(Math.random() * 101);
            let status;
            if (rand <25) {
                status = 3;
            } else if (rand <50) {
                status = 2;
            } else {
                status = 1;
            }

            const user = 20;
            const get_date = mysql.format(
                "SELECT startTime FROM classes WHERE idclasses = ? LIMIT 1",
                [i]
            )
            
            await connection.query(get_date, async(err, result) => {
                const date = result[0].startTime;
                const insert_query = mysql.format(
                    "INSERT INTO `se_site`.`attendance` (`attendanceStatus`, `classID`, `userID`, `dateTime`) VALUES (?, ?, ?, ?)",
                    [status, i, user, date]
                )
                pool.getConnection(async(err, connection)=> {
                    connection.release();
                    await connection.query(insert_query);
                })
            });
            
        }

    });
});

app.get("/artificial-classes", async(req,res) => {

    pool.getConnection(async(err, connection)=> {

        const now = new Date();
        const end = new Date();
        const result = [];

        now.setDate(now.getDate() - now.getDay() + 2+7);
        end.setDate(now.getDate() - now.getDay() + 2+7);

        //UPDATE:
        const userID=5;
        const start = 5;

        for (let i = 5; i < (200); i++) {

            //UPDATE
            now.setHours(13, 30, 0, 0);
            end.setHours(14, 20, 0, 0);


            const add_class_query = mysql.format(
                "INSERT INTO `se_site`.`classes` (idclasses, courseID, `startTime`, endTime) VALUES (?,?,?,?);",
                [i, courseID, now, end]
            )
            await connection.query(add_class_query);

            
            now.setDate(now.getDate() - 7);
        }

    });
});

app.listen (port, ()=> {
    console.log('Listening...');
});