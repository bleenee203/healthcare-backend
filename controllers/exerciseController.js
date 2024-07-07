const { default: mongoose } = require("mongoose");
const exercise = require("../models/exerciseModel");
const moment = require('moment-timezone');
const Exercise = require("../models/exerciseModel");
const systemTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
console.log(systemTimeZone)
module.exports.createExercise = async (req, res, next) => {
    try {
        const { type, calo_burn, date, duration, distance, start_time } = req.body.newData;

        if (!type || !calo_burn || !date) {
            return res.status(403).send({
                success: false,
                message: "Please provide type or calo burn or date"
            });
        }

        const user_id = req.body.userId;
        const formatdate = moment().tz(systemTimeZone).toISOString()
        const formattedDate = moment.tz(date, systemTimeZone).utc().toISOString();
        const formattedStartTime = start_time ? moment.tz(start_time, systemTimeZone).utc().toISOString() : null;
    
        // if(date){
        //     date = moment(date, 'DD/MM/YYYY').add(12, 'hours').toDate();
        //   }
      
        //   if (start_time) {
        //     const timeString = start_time;
            
        //     const [hours, minutes] = timeString.split(":").map(part => parseInt(part, 10));
        //     if (!isNaN(hours) && !isNaN(minutes)) {
        //       const StartTime = new Date();
        //       StartTime.setHours(hours, minutes, 0); // Đặt giờ, phút và giây
            
        //       start_time = StartTime;
        //     } else {
        //       console.error('Invalid time format:', timeString);
        //       // Xử lý lỗi hoặc thông báo lỗi cho người dùng
        //     }
        //   }

        const newExercise = await Exercise.create({
            type,
            duration,
            distance,
            calo_burn,
            date: formattedDate,
            start_time: formattedStartTime,
            updated_at: formatdate,
            user_id,
        });

        return res.status(200).json({
            success: true,
            Exercise: newExercise,
            message: "Successfully recorded exercise log"
        });
    } catch (error) {
        console.error(error);
        next(error);
    }
};

exports.getExerciseLog = async (req, res, next) => {
    try {
        const { user_id, weekStartDate } = req.query;

        // Kiểm tra xem ngày bắt đầu tuần được cung cấp có hợp lệ không
        if (!weekStartDate) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid week start date (ISO format)"
            });
        }

        // Chuyển đổi ngày bắt đầu tuần từ chuỗi ISO thành đối tượng Date
        const startOfWeek = moment.tz(weekStartDate,systemTimeZone).startOf('isoWeek').toDate();
        const endOfWeek = moment.tz(weekStartDate,systemTimeZone).endOf('isoWeek').toDate();

        // Truy vấn danh sách ngày và tổng lượng nước uống trong cùng một tuần sử dụng aggregation
        const exercises = await Exercise.aggregate([
            {
                $match: {
                    user_id: mongoose.Types.ObjectId.createFromHexString(user_id),
                    date: {
                        $gte: startOfWeek,  // Lớn hơn hoặc bằng ngày bắt đầu tuần
                        $lte: endOfWeek     // Nhỏ hơn hoặc bằng ngày kết thúc tuần
                    }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$date", timezone: systemTimeZone } }, // Nhóm theo ngày tháng
                    dates: { $push: { $dateToString: { format: "%Y-%m-%d", date: "$date", timezone: systemTimeZone } } }, // Danh sách các ngày trong tuần
                    totalCaloBurn: { $sum: "$calo_burn" } // Tổng lượng nước uống trong tuần
                }
            },
            {
                $project: {
                    _id: 0, // Loại bỏ trường _id được tạo ra từ $group
                    date: "$_id", // Trường date là ngày tháng
                    // dates: 1,     // Bao gồm trường dates
                    totalCaloBurn: 1 // Tổng lượng nước uống trong tuần
                }
            }
        ]);

        // Chuyển đổi các ngày từ UTC sang múi giờ hệ thống và định dạng lại
        const convertedExercises = exercises.map(exercise => ({
            date: moment(exercise.date).tz(systemTimeZone).format('DD/MM/YYYY'),
            // dates: drink.dates.map(date => moment(date).tz(systemTimeZone).format('DD/MM/YYYY')),
            totalCaloBurn: exercise.totalCaloBurn
        }));

        return res.status(200).json({
            success: true,
            exercises: convertedExercises
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch weekly calo burn summary"
        });
    }
};