import { logger } from "../../utils/logger.js";
import { certificatesService } from "./certificatesService.js";
import { supabaseServer } from "../../config/db.js";

const getMyCertificates = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }
    const { data: userData, error } = await supabaseServer.auth.getUser(token);
    if (error || !userData.user) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }
    const certs = await certificatesService.getUserCertificates(
      userData.user.id,
    );
    res.json({
      certificates: certs,
    });
  } catch (err) {
    logger.error("Error in certificatesController.js:", err);
    res.status(500).json({
      error: err.message,
    });
  }
};

const getCertificateByCode = async (req, res) => {
  try {
    const cert = await certificatesService.getCertificateDetail(
      req.params.code,
    );
    if (!cert)
      return res.status(404).json({
        error: "Not found",
      });
    res.json({
      certificate: cert,
    });
  } catch (err) {
    logger.error("Error in certificatesController.js:", err);
    res.status(500).json({
      error: err.message,
    });
  }
};

export const certificatesController = {
  getMyCertificates,
  getCertificateByCode,
};
