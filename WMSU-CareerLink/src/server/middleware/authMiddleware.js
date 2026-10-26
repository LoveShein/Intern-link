const jwt = require('jsonwebtoken');

/** Verify the bearer token and attach the decoded user to the request. */
function authenticateToken(req, res, next) {
	const [scheme, token] = (req.headers.authorization || '').split(' ');

	if (scheme !== 'Bearer' || !token) {
		return res.status(401).json({ message: 'Authentication token is required.' });
	}

	const secret = process.env.JWT_SECRET;
	if (!secret) {
		return res.status(500).json({ message: 'Authentication is not configured.' });
	}

	jwt.verify(token, secret, (error, decoded) => {
		if (error) {
			return res.status(401).json({ message: 'Invalid or expired authentication token.' });
		}

		req.user = decoded;
		return next();
	});
}

/** Allow access only when the authenticated user's role is permitted. */
function authorizeRoles(...allowedRoles) {
	return (req, res, next) => {
		if (!req.user) {
			return res.status(401).json({ message: 'Authentication is required.' });
		}

		if (!allowedRoles.includes(req.user.role)) {
			return res.status(403).json({ message: 'You do not have permission to access this resource.' });
		}

		return next();
	};
}

module.exports = authenticateToken;
module.exports.authenticateToken = authenticateToken;
module.exports.authorizeRoles = authorizeRoles;
