const Payment = require("../models/paymentModel");

const Job = require("../models/jobModel");

const Application = require("../models/applicationModel");

// CREATE PAYMENT
exports.createPayment = async (req, res, next) => {
  try {
    const { jobId, amount } = req.body;

    // VALIDATION
    if (!amount || amount <= 0) {
      return res.status(400).json({
        message: "Invalid payment amount",
      });
    }

    // FIND JOB
    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({
        message: "Job not found",
      });
    }

    // FIND ACCEPTED APPLICATION
    const acceptedApplication = await Application.findOne({
      job: jobId,

      status: "Accepted",
    });

    if (!acceptedApplication) {
      return res.status(400).json({
        message: "No accepted tradesperson found",
      });
    }

    // CALCULATIONS
    const parsedAmount = Number(amount);

    const platformFee = parsedAmount * 0.1;

    const totalAmount = parsedAmount + platformFee;

    // CREATE PAYMENT
    const payment = await Payment.create({
      job: job._id,

      homeowner: req.user._id,

      tradesperson: acceptedApplication.tradesperson,

      amount: parsedAmount,

      platformFee,

      totalAmount,

      paymentStatus: "Paid",
    });

    // UPDATE JOB STATUS
    await Job.findByIdAndUpdate(jobId, {
      status: "In Progress",
    });

    res.status(201).json(payment);
  } catch (error) {
    console.error(error);

    next(error);
  }
};

// GET MY PAYMENTS
exports.getMyPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find({
      $or: [
        {
          homeowner: req.user._id,
        },

        {
          tradesperson: req.user._id,
        },
      ],
    })
      .populate("job", "title status")
      .populate("homeowner", "name")
      .populate("tradesperson", "name")
      .sort({
        createdAt: -1,
      });

    res.status(200).json(payments);
  } catch (error) {
    console.error(error);

    next(error);
  }
};
