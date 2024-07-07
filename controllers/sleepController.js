const { default: mongoose } = require("mongoose");
const moment = require('moment-timezone');
const Sleep = require("../models/sleepModel");
const systemTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
console.log(systemTimeZone)
module.exports.createSleep = async (req, res, next) => {
    try {
        const { start_time, end_time, duration } = req.body.newData;
        if (!start_time || !end_time || !duration) {
            return res.status(403).send({
                success: false,
                message: "Please provide start sleep time and end sleep time"
            });
        }
        const user_id = req.body.userId;
        const isDeleted = false;
        const formatdate = moment.tz(systemTimeZone).toISOString()
        const formattedStartTime = moment.tz(start_time, systemTimeZone).utc().toISOString();
        const formattedEndTime = moment.tz(end_time, systemTimeZone).utc().toISOString();
        const newSleep = await Sleep.create({
            user_id,
            start_time: formattedStartTime,
            end_time: formattedEndTime,
            duration,
            created_at: formatdate,
            updated_at:formatdate,
            isDeleted
        });
        return res.status(200).json({
            success: true,
            Sleep: newSleep,
            message: "Successfully recorded sleep log"
        });
    } catch (error) {
        console.error(error);
        next(error);
    }
};

  // exports.deleteDrink = async (req, res, next) => {
  //   try {
  //     const  id  = req.params.id;
  //     const updatedDrink = await drink.findByIdAndUpdate(id, { isDeleted:true});
  //     if (!updatedDrink) {
  //       return res.status(404).json({ success: false, message: 'Cant find the water log' });
  //     }
  //     return res.status(200).json({
  //       success: true,
  //       message: 'Remove water log successfully',
  //     });
  //   } catch (err) {
  //     next(err);
  //   }
  // };

exports.getSleepLog = async (req, res, next) => {
    try {
        const { user_id, weekStartDate } = req.query;

        // Kiểm tra xem ngày bắt đầu tuần được cung cấp có hợp lệ không
        if (!weekStartDate) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid week start date (ISO format)"
            });
        }
        console.log(weekStartDate)
        // Chuyển đổi ngày bắt đầu tuần từ chuỗi ISO thành đối tượng Date
        const startOfWeek = moment.tz(weekStartDate,systemTimeZone).startOf('isoWeek').toDate();
        const endOfWeek = moment.tz(weekStartDate,systemTimeZone).endOf('isoWeek').toDate();

        // Truy vấn danh sách ngày và tổng lượng nước uống trong cùng một tuần sử dụng aggregation
        const sleeps = await Sleep.aggregate([
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
                    totalDuration: { $sum: "$duration" }, // Tổng lượng thời gian ngủ trong tuần
                }
            },
            {
                $project: {
                    _id: 0, // Loại bỏ trường _id được tạo ra từ $group
                    date: "$_id", // Trường date là ngày tháng
                    // dates: 1,     // Bao gồm trường dates
                    totalDuration: 1 // Tổng lượng thời gian ngủ trong tuần
                }
            }
        ]);
        const weekDates = [];
        for (let i = 0; i < 7; i++) {
            const date = moment(startOfWeek).add(i, 'days').format('YYYY-MM-DD');
            weekDates.push(date);
        }

        const sleepsMap = sleeps.reduce((acc, sleep) => {
            acc[sleep.date] = sleep.totalDuration;
            console.log(acc[sleep.date]);
            return acc;
        }, {});

        const convertedSleeps = weekDates.map(date => ({
            date: moment(date, 'YYYY-MM-DD').format('DD/MM/YYYY'), // Chuyển đổi định dạng ngày trước khi trả về
            totalDuration: sleepsMap[date] || 0
        }));

        
        // Calculate the total and average water intake for the week
        const totalSleepIntake = convertedSleeps.reduce((total, sleep) => total + sleep.totalDuration, 0);
        const averageSleepIntake = (totalSleepIntake / 7).toFixed(2);

        return res.status(200).json({
            success: true,
            sleeps: convertedSleeps,
            avg: averageSleepIntake
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch weekly sleep summary"
        });
    }
};
exports.getSleepLogByMonth = async (req, res, next) => {
    try {
        const { user_id, monthStartDate } = req.query;

        // Kiểm tra xem ngày bắt đầu tháng được cung cấp có hợp lệ không
        if (!monthStartDate) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid month start date (ISO format)"
            });
        }

        // Chuyển đổi ngày bắt đầu tháng từ chuỗi ISO thành đối tượng Date
        const startOfMonth = moment.tz(monthStartDate, systemTimeZone).startOf('month').toDate();
        const endOfMonth = moment.tz(monthStartDate, systemTimeZone).endOf('month').toDate();

        // Truy vấn danh sách ngày và tổng lượng nước uống trong cùng một tháng sử dụng aggregation
        const sleeps = await Sleep.aggregate([
            {
                $match: {
                    user_id: mongoose.Types.ObjectId.createFromHexString(user_id),
                    date: {
                        $gte: startOfMonth,  // Lớn hơn hoặc bằng ngày bắt đầu tháng
                        $lte: endOfMonth     // Nhỏ hơn hoặc bằng ngày kết thúc tháng
                    }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$date", timezone: systemTimeZone } }, // Nhóm theo ngày tháng
                    dates: { $push: { $dateToString: { format: "%Y-%m-%d", date: "$date", timezone: systemTimeZone } } }, // Danh sách các ngày trong tháng
                    totalDuration: { $sum: "$duration" } // Tổng thời gian ngủ trong tháng
                }
            },
            {
                $project: {
                    _id: 0, // Loại bỏ trường _id được tạo ra từ $group
                    date: "$_id", // Trường date là ngày tháng
                    // dates: 1,     // Bao gồm trường dates nếu cần
                    totalDuration: 1 // Tổng lượng nước uống trong tháng
                }
            }
        ]);

        // Tạo một mảng chứa tất cả ngày trong tháng
        const monthDates = [];
        const daysInMonth = moment(startOfMonth).daysInMonth(); // Số ngày trong tháng
        for (let i = 0; i < daysInMonth; i++) {
            const date = moment(startOfMonth).add(i, 'days').format('YYYY-MM-DD');
            monthDates.push(date);
        }

        // Tạo một đối tượng ánh xạ với ngày là khóa và lượng nước uống là giá trị
        const sleepsMap = sleeps.reduce((acc, sleep) => {
            acc[sleep.date] = sleep.totalDuration;
            return acc;
        }, {});

        // Chuyển đổi dữ liệu để phù hợp với định dạng ngày trước khi trả về
        const convertedSleeps = monthDates.map(date => ({
            date: moment(date, 'YYYY-MM-DD').format('DD/MM/YYYY'),
            totalDuration: sleepsMap[date] || 0
        }));

        // Tính toán tổng và trung bình lượng nước uống trong tháng
        const totalSleepIntake = convertedSleeps.reduce((total, sleep) => total + sleep.totalDuration, 0);
        const averageSleepIntake = (totalSleepIntake / daysInMonth).toFixed(2);

        return res.status(200).json({
            success: true,
            sleeps: convertedSleeps,
            avg: averageSleepIntake
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch monthly sleep summary"
        });
    }
};
exports.getSleepWeekLogByMonth = async (req, res, next) => {
    try {
        const { user_id, month } = req.query;

        // Kiểm tra xem tháng và user_id được cung cấp có hợp lệ không
        if (!user_id || !month) {
            return res.status(400).json({
                success: false,
                message: "Please provide user_id and month (format: 'YYYY-MM')"
            });
        }

        // Chuyển đổi tháng từ chuỗi 'YYYY-MM' thành đối tượng Date
        const startOfMonth = moment(month, 'YYYY-MM').startOf('month').toDate();
        const endOfMonth = moment(month, 'YYYY-MM').endOf('month').toDate();

        // Truy vấn danh sách ngày và tổng lượng nước uống trong cùng một tháng sử dụng aggregation
        const drinks = await Drink.aggregate([
            {
                $match: {
                    user_id: mongoose.Types.ObjectId.createFromHexString(user_id),
                    date: {
                        $gte: startOfMonth, // Lớn hơn hoặc bằng ngày bắt đầu tháng
                        $lte: endOfMonth    // Nhỏ hơn hoặc bằng ngày kết thúc tháng
                    }
                }
            },
            {
                $group: {
                    _id: { week: { $isoWeek: "$date" } }, // Nhóm theo tuần trong năm
                    totalAmount: { $sum: "$amount" } // Tổng lượng nước uống trong tuần
                }
            },
            {
                $project: {
                    _id: 0, // Loại bỏ trường _id được tạo ra từ $group
                    week: "$_id.week", // Trường week là số tuần trong năm
                    totalAmount: 1 // Tổng lượng nước uống trong tuần
                }
            }
        ]);

        // Tạo một mảng chứa các tuần trong tháng
        const weeksInMonth = [];
        const startWeek = moment(startOfMonth).isoWeek();
        const endWeek = moment(endOfMonth).isoWeek();

        for (let week = startWeek; week <= endWeek; week++) {
            weeksInMonth.push(week);
        }

        // Chuyển đổi dữ liệu để phù hợp với định dạng mong muốn trước khi trả về
        const convertedDrinks = weeksInMonth.map(week => {
            const drinkOfWeek = drinks.find(drink => drink.week === week);
            return {
                week: week,
                totalAmount: drinkOfWeek ? drinkOfWeek.totalAmount : 0
            };
        });

        return res.status(200).json({
            success: true,
            month: month,
            drinks: convertedDrinks
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch weekly drink summary"
        });
    }
};
// exports.getWaterMonthLogByYear = async (req, res, next) => {
//     try {
//         const { user_id, date } = req.query;

//         // Check if date and user_id are provided
//         if (!user_id || !date) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Please provide user_id and date (format: 'YYYY-MM-DD')"
//             });
//         }

//         // Get the year from the provided date
//         const year = moment(date, 'YYYY-MM-DD').year();

//         // Initialize an array to hold the drink data for each month
//         const yearDrinks = [];

//         // Iterate through each month of the year
//         for (let month = 0; month < 12; month++) {
//             const startOfMonth = moment().year(year).month(month).startOf('month').toDate();
//             const endOfMonth = moment().year(year).month(month).endOf('month').toDate();

//             // Query the drink data for the month
//             const drinks = await Drink.aggregate([
//                 {
//                     $match: {
//                         user_id: mongoose.Types.ObjectId.createFromHexString(user_id),
//                         date: {
//                             $gte: startOfMonth,
//                             $lte: endOfMonth
//                         }
//                     }
//                 },
//                 {
//                     $group: {
//                         _id: null, // We don't need to group by any specific field
//                         totalAmount: { $sum: "$amount" }
//                     }
//                 },
//                 {
//                     $project: {
//                         _id: 0,
//                         totalAmount: 1
//                     }
//                 }
//             ]);

//             // If there are no drinks recorded for the month, set totalAmount to 0
//             const totalAmount = drinks.length > 0 ? drinks[0].totalAmount : 0;

//             // Add the month's totalAmount to the yearDrinks array
//             yearDrinks.push({
//                 month: month + 1, // Month is zero-based, so we add 1
//                 totalAmount: totalAmount
//             });
//         }

//         // Calculate the average water intake per month
//         const totalYearAmount = yearDrinks.reduce((sum, monthData) => sum + monthData.totalAmount, 0);
//         const averageMonthlyIntake = (totalYearAmount / 12).toFixed(2);

//         return res.status(200).json({
//             success: true,
//             year: year,
//             drinks: yearDrinks,
//             avg: parseFloat(averageMonthlyIntake)
//         });
//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({
//             success: false,
//             message: "Failed to fetch monthly drink summary"
//         });
//     }
// };
exports.getWaterMonthLogByYear = async (req, res, next) => {
    try {
        const { user_id, date } = req.query;

        // Check if date and user_id are provided
        if (!user_id || !date) {
            return res.status(400).json({
                success: false,
                message: "Please provide user_id and date (format: 'YYYY-MM-DD')"
            });
        }

        // Get the year from the provided date
        const year = moment(date, 'YYYY-MM-DD').year();

        // Initialize arrays to hold the drink data for each month and each day
        const yearDrinks = [];
        const yearDays = [];

        // Iterate through each month of the year
        for (let month = 0; month < 12; month++) {
            const startOfMonth = moment().year(year).month(month).startOf('month').toDate();
            const endOfMonth = moment().year(year).month(month).endOf('month').toDate();

            // Query the drink data for the month, including daily totals
            const drinks = await Drink.aggregate([
                {
                    $match: {
                        user_id: mongoose.Types.ObjectId.createFromHexString(user_id),
                        date: {
                            $gte: startOfMonth,
                            $lte: endOfMonth
                        }
                    }
                },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } }, // Group by day of the month
                        totalAmount: { $sum: "$amount" }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        date: "$_id",
                        totalAmount: 1
                    }
                }
            ]);

            // Create a map of drinks by date
            const drinksMap = drinks.reduce((acc, drink) => {
                acc[drink.date] = drink.totalAmount;
                return acc;
            }, {});

            // Create an array of all dates in the month
            const monthDates = [];
            const daysInMonth = moment(startOfMonth).daysInMonth();
            for (let i = 0; i < daysInMonth; i++) {
                const date = moment(startOfMonth).add(i, 'days').format('YYYY-MM-DD');
                monthDates.push(date);
            }

            // Convert the data to match the desired format and add to yearDays array
            const convertedDrinks = monthDates.map(date => {
                const totalAmount = drinksMap[date] || 0;
                yearDays.push({
                    date: moment(date, 'YYYY-MM-DD').format('DD/MM/YYYY'),
                    totalAmount: totalAmount
                });
                return totalAmount;
            });

            // Calculate the total amount for the month
            const monthTotalAmount = convertedDrinks.reduce((sum, amount) => sum + amount, 0);

            // Add the month's data to the yearDrinks array
            yearDrinks.push({
                month: month + 1, // Month is zero-based, so we add 1
                totalAmount: monthTotalAmount
            });
        }

        // Calculate the average water intake per month
        const totalYearAmount = yearDrinks.reduce((sum, monthData) => sum + monthData.totalAmount, 0);
        const averageMonthlyIntake = (totalYearAmount / 12).toFixed(2);

        return res.status(200).json({
            success: true,
            year: year,
            drinks: yearDrinks,
            days: yearDays,
            avg: averageMonthlyIntake
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch monthly drink summary"
        });
    }
};
