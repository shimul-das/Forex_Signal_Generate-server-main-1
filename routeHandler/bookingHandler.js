const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bookingSchema = require('../schemas/bookingSchema');
const verifyToken = require("../middlewares/verifyToken")
const Booking = new mongoose.model("Booking" , bookingSchema);

// const User = new mongoose.model("User", userSchema);

router.get('/',  async(req, res) => {
    try {
        const bookings = await Booking.find({});
        res.status(200).json(bookings);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'There was a server side error!'
        });
    }
});

router.get('/:email', verifyToken, async (req, res) => {
    try {
        const { email } = req.params; 
        const bookingsByEmail = await Booking.find({ email }); 
        res.status(200).json(bookingsByEmail);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'There was a server side error!'
        });
    }
});


// router.post('/', async (req, res) => {
//     try {
//         const newBooking = new Booking(req.body);
//         await newBooking.save();
//         res.status(200).json({
//             message: "Bookednodemon successfully"
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({
//             error: "There was a server side error!"
//         });
//     }
// });

router.post('/', async (req, res) => {
    try {
        const bookingData = { ...req.body };

        // Ensure paymentStatus has a valid default if not provided
        if (!bookingData.paymentStatus) {
            bookingData.paymentStatus = 'pending';
        }

        const newBooking = new Booking(bookingData);
        await newBooking.save();

        res.status(200).json({
            message: 'Booking successfully created',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'There was a server-side error!',
        });
    }
});




router.put('/:id', async(req, res)=>{

});


router.patch('/:id', async (req, res) => {
    const { id } = req.params;
    console.log(id);

    try {
        const booking = await Booking.findById(id); 

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        
        booking.bookingStatus = req.body.bookingStatus || booking.bookingStatus;
        booking.deliveryMenId = req.body.deliveryMenId || booking.deliveryMenId;
        booking.approximateDeliveryDate = req.body.approximateDeliveryDate || booking.approximateDeliveryDate;

        const updatedBooking = await booking.save(); 

        res.status(200).json(updatedBooking);
        console.log('okkkkk');
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

/////////

// router.patch('/:id', async (req, res) => {
//     const { id } = req.params;

//     try {
//         const booking = await Booking.findById(id);

//         if (!booking) {
//             return res.status(404).json({ message: 'Booking not found' });
//         }

//         const { bookingStatus } = req.body;

//         if (!bookingStatus || (bookingStatus !== 'Cancelled' && bookingStatus !== 'Delivered')) {
//             return res.status(400).json({ message: 'Invalid booking status' });
//         }

//         booking.bookingStatus = bookingStatus;
//         const updatedBooking = await booking.save();

//         res.status(200).json(updatedBooking);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// });

//

router.patch('/payment/:id', async (req, res) => {
    const { id } = req.params;
    const { bookingStatus, paymentStatus } = req.body; // Accept multiple fields for updates

    try {
        const booking = await Booking.findById(id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Update bookingStatus if provided and valid
        if (bookingStatus) {
            if (bookingStatus !== 'Cancelled' && bookingStatus !== 'Delivered' && bookingStatus !== 'Pending') {
                return res.status(400).json({ message: 'Invalid booking status' });
            }
            booking.bookingStatus = bookingStatus;
        }

        // Update paymentStatus if provided and valid
        if (paymentStatus) {
            if (paymentStatus !== 'paid' && paymentStatus !== 'pending') {
                return res.status(400).json({ message: 'Invalid payment status' });
            }
            booking.paymentStatus = paymentStatus;
        }

        const updatedBooking = await booking.save(); // Save updates
        res.status(200).json(updatedBooking); // Respond with updated booking
    } catch (error) {
        console.error("Error updating booking:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

//
// router.patch('/:id', async (req, res) => {
//     const { id } = req.params;
//     console.log(id);

//     try {
//         const booking = await Booking.findById(id); 

//         if (!booking) {
//             return res.status(404).json({ message: 'Booking not found' });
//         }

//         // Update bookingStatus if provided and valid
//         if (req.body.bookingStatus) {
//             const validBookingStatuses = ['Cancelled', 'Delivered', 'Pending'];
//             if (!validBookingStatuses.includes(req.body.bookingStatus)) {
//                 return res.status(400).json({ message: 'Invalid booking status' });
//             }
//             booking.bookingStatus = req.body.bookingStatus;
//         }

//         // Update paymentStatus if provided and valid
//         if (req.body.paymentStatus) {
//             const validPaymentStatuses = ['paid', 'pending'];
//             if (!validPaymentStatuses.includes(req.body.paymentStatus)) {
//                 return res.status(400).json({ message: 'Invalid payment status' });
//             }
//             booking.paymentStatus = req.body.paymentStatus;
//         }

//         // Optionally update other fields
//         booking.deliveryMenId = req.body.deliveryMenId || booking.deliveryMenId;
//         booking.approximateDeliveryDate = req.body.approximateDeliveryDate || booking.approximateDeliveryDate;

//         const updatedBooking = await booking.save(); 

//         res.status(200).json(updatedBooking);
//         console.log('Booking updated successfully');
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// });

// router.patch('/location/:deliveryManId', async (req, res) => {
//     const { deliveryManId } = req.params;
//     const { latitude, longitude } = req.body;

//     try {
//         console.log(`Received update request for DeliveryMan ID: ${deliveryManId}`);
//         console.log(`Latitude: ${latitude}, Longitude: ${longitude}`); // Log incoming coordinates

//         // Update all parcels assigned to this deliveryman
//         const updatedParcels = await Booking.updateMany(
//             { deliveryMenId: deliveryManId }, // Find all parcels assigned to the deliveryman
//             {
//                 $set: {
//                     "deliverymanliveAddressLatitude": latitude,
//                     "deliverymanliveAddressLongitude": longitude
//                 }
//             }
//         );

//         if (updatedParcels.modifiedCount === 0) {
//             console.log(`No parcels found for DeliveryMan ID: ${deliveryManId}`);
//             return res.status(404).json({ message: 'No parcels found for this deliveryman' });
//         }

//         // Log total updated count
//         console.log(`Total updated parcels: ${updatedParcels.modifiedCount}`);

//         res.status(200).json({ 
//             message: `All parcels' locations updated successfully. Total updated: ${updatedParcels.modifiedCount}`, 
//             updatedCount: updatedParcels.modifiedCount 
//         });
//     } catch (error) {
//         console.error("Error updating locations:", error);
//         res.status(500).json({ error: "Internal Server Error" });
//     }
// });

router.patch('/location/:parcelId', async (req, res) => {
    const { parcelId } = req.params;
    const { latitude, longitude } = req.body;

    try {
        console.log(`Received update for Parcel ID: ${parcelId}`);
        console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);

        if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
            return res.status(400).json({ error: "Invalid latitude or longitude" });
        }

        const updatedParcel = await Booking.findByIdAndUpdate(
            parcelId,
            { $set: { livelocation: { latitude, longitude } } },
            { new: true }
        );

        if (!updatedParcel) {
            console.log(`Parcel not found: ${parcelId}`);
            return res.status(404).json({ message: "Parcel not found" });
        }

        console.log(`Parcel updated: ${parcelId}`);
        res.status(200).json({ message: "Parcel location updated", parcel: updatedParcel });
    } catch (error) {
        console.error("Error updating parcel location:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});






router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const deletedBooking = await Booking.findByIdAndDelete(id);

        if (!deletedBooking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        res.status(200).json({ message: 'Booking deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
