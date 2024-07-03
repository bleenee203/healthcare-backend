const { default: mongoose } = require("mongoose");
const drink = require("../models/drinkModel");
const moment = require('moment-timezone');
const Drink = require("../models/drinkModel");
const systemTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
console.log(systemTimeZone)
module.exports.createDrink = async (req, res, next) => {
    try {
        const { amount } = req.body.newData;

        if (!amount) {
            return res.status(403).send({
                success: false,
                message: "Please provide amount of water"
            });
        }


        const user_id = req.body.userId;
        const isDeleted = false;
        const formatdate = moment.tz(systemTimeZone).toISOString()

        const newDrink = await Drink.create({
            user_id,
            date: formatdate,
            updated_at:formatdate,
            amount,
            isDeleted
        });

        return res.status(200).json({
            success: true,
            Drink: newDrink,
            message: "Successfully recorded water intake log"
        });
    } catch (error) {
        console.error(error);
        next(error);
    }
};

  exports.deleteDrink = async (req, res, next) => {
    try {
      const  id  = req.params.id;
      const updatedDrink = await drink.findByIdAndUpdate(id, { isDeleted:true});
      if (!updatedDrink) {
        return res.status(404).json({ success: false, message: 'Cant find the water log' });
      }
      return res.status(200).json({
        success: true,
        message: 'Remove water log successfully',
      });
    } catch (err) {
      next(err);
    }
  };
// exports.getWaterLog = async (req, res, next) => {
//     try {
//         const { user_id, weekStartDate } = req.query;

//         // Kiểm tra xem ngày bắt đầu tuần được cung cấp có hợp lệ không
//         if (!weekStartDate) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Please provide a valid week start date (ISO format)"
//             });
//         }

//         // Chuyển đổi ngày bắt đầu tuần từ chuỗi ISO thành đối tượng Date
//         const startOfWeek = moment.tz(weekStartDate, systemTimeZone).startOf('isoWeek').toISOString();
//         const endOfWeek = moment.tz(weekStartDate, systemTimeZone).endOf('isoWeek').toISOString();

//         // Truy vấn danh sách ngày và tổng lượng nước uống trong cùng một tuần sử dụng aggregation
//         const drinks = await Drink.aggregate([
//             {
//                 $match: {
//                     user_id: mongoose.Types.ObjectId.createFromHexString(user_id),
//                     date: {
//                         $gte: new Date(startOfWeek),  // Lớn hơn hoặc bằng ngày bắt đầu tuần
//                         $lte: new Date(endOfWeek)     // Nhỏ hơn hoặc bằng ngày kết thúc tuần
//                     }
//                 }
//             },
//             {
//                 $group: {
//                     _id: {
//                         week: { $isoWeek: "$date" }, // Số tuần trong năm của ngày
//                         year: { $year: "$date" }     // Năm của ngày
//                     },
//                     dates: { $push: "$date" },      // Danh sách các ngày trong tuần
//                     totalAmount: { $sum: "$amount" } // Tổng lượng nước uống trong tuần
//                 }
//             },
//             {
//                 $project: {
//                     _id: 0, // Loại bỏ trường _id được tạo ra từ $group
//                     week: "$_id.week",   // Số tuần trong năm
//                     year: "$_id.year",   // Năm
//                     dates: 1,            // Bao gồm trường dates
//                     totalAmount: 1       // Tổng lượng nước uống trong tuần
//                 }
//             }
//         ]);

//         // Chuyển đổi các ngày từ UTC sang múi giờ hệ thống trước khi trả về
//         const convertedDrinks = drinks.map(drink => ({
//             ...drink,
//             dates: drink.dates.map(date => moment(date).tz(systemTimeZone).format('DD/MM/YYYY HH:mm:ss'))
//         }));

//         return res.status(200).json({
//             success: true,
//             drinks: convertedDrinks
//         });
//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({
//             success: false,
//             message: "Failed to fetch weekly drink summary"
//         });
//     }
// };
exports.getWaterLog = async (req, res, next) => {
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
        const drinks = await Drink.aggregate([
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
                    totalAmount: { $sum: "$amount" } // Tổng lượng nước uống trong tuần
                }
            },
            {
                $project: {
                    _id: 0, // Loại bỏ trường _id được tạo ra từ $group
                    date: "$_id", // Trường date là ngày tháng
                    // dates: 1,     // Bao gồm trường dates
                    totalAmount: 1 // Tổng lượng nước uống trong tuần
                }
            }
        ]);

        // Chuyển đổi các ngày từ UTC sang múi giờ hệ thống và định dạng lại
        const convertedDrinks = drinks.map(drink => ({
            date: moment(drink.date).tz(systemTimeZone).format('DD/MM/YYYY'),
            // dates: drink.dates.map(date => moment(date).tz(systemTimeZone).format('DD/MM/YYYY')),
            totalAmount: drink.totalAmount
        }));

        return res.status(200).json({
            success: true,
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