import { Link } from 'react-router-dom';

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col justify-between">
            {/* Hero Section */}
            <div className="relative overflow-hidden flex-1">
                <div className="max-w-7xl mx-auto">
                    <div className="relative z-10 pb-8 bg-transparent sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
                        <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
                            <div className="sm:text-center lg:text-left">
                                <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl">
                                    <span className="block xl:inline">Stop AI Bots</span>{' '}
                                    <span className="block text-blue-400 xl:inline">Start Earning Revenue</span>
                                </h1>
                                <p className="mt-3 text-base text-gray-300 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                                    Turn AI bot traffic into revenue streams. Our advanced detection system identifies unauthorized crawlers and converts them into paying customers, protecting your content while generating income.
                                </p>
                                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                                    <div className="rounded-md shadow">
                                        <Link
                                            to="/dashboard"
                                            className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10 transition duration-300"
                                        >
                                            Get Started
                                        </Link>
                                    </div>
                                    <div className="mt-3 sm:mt-0 sm:ml-3">
                                        <Link
                                            to="/pricing"
                                            className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-400 bg-gray-800 hover:bg-gray-700 md:py-4 md:text-lg md:px-10 transition duration-300"
                                        >
                                            View Pricing
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </main>
                    </div>
                </div>


                {/* Features Section */}
                <div className="py-12 bg-gray-800">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="lg:text-center">
                            <h2 className="text-base text-blue-400 font-semibold tracking-wide uppercase">Features</h2>
                            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-white sm:text-4xl">
                                Advanced Bot Protection & Monetization
                            </p>
                            <p className="mt-4 max-w-2xl text-xl text-gray-300 lg:mx-auto">
                                Protect your content from unauthorized AI crawlers while generating revenue from legitimate bot access requests.
                            </p>
                        </div>

                        <div className="mt-10">
                            <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
                                <div className="relative">
                                    <dt>
                                        <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                                            🧠
                                        </div>
                                        <p className="ml-16 text-lg leading-6 font-medium text-white">AI-Powered Bot Detection</p>
                                    </dt>
                                    <dd className="mt-2 ml-16 text-base text-gray-300">
                                        Advanced machine learning algorithms identify AI crawlers with 95%+ accuracy, distinguishing between legitimate users and unauthorized bots.
                                    </dd>
                                </div>

                                <div className="relative">
                                    <dt>
                                        <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                                            ⚡
                                        </div>
                                        <p className="ml-16 text-lg leading-6 font-medium text-white">Revenue Generation</p>
                                    </dt>
                                    <dd className="mt-2 ml-16 text-base text-gray-300">
                                        Convert bot traffic into revenue streams with automated payment collection and customizable pricing rules.
                                    </dd>
                                </div>

                                <div className="relative">
                                    <dt>
                                        <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                                            🔒
                                        </div>
                                        <p className="ml-16 text-lg leading-6 font-medium text-white">Content Protection</p>
                                    </dt>
                                    <dd className="mt-2 ml-16 text-base text-gray-300">
                                        Secure your valuable content from unauthorized scraping while maintaining legitimate access for paying customers.
                                    </dd>
                                </div>

                                <div className="relative">
                                    <dt>
                                        <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                                            📊
                                        </div>
                                        <p className="ml-16 text-lg leading-6 font-medium text-white">Real-time Analytics</p>
                                    </dt>
                                    <dd className="mt-2 ml-16 text-base text-gray-300">
                                        Track bot activity, revenue generation, and protection effectiveness with comprehensive real-time analytics.
                                    </dd>
                                </div>
                            </dl>
                        </div>
                    </div>
                </div>

                {/* CTA Section */}
                <div className="bg-gray-900">
                    <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
                        <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                            <span className="block">Ready to protect your content?</span>
                            <span className="block text-blue-400">Start earning from bot traffic today.</span>
                        </h2>
                        <p className="mt-4 text-lg leading-6 text-gray-300">
                            Join thousands of website owners who have turned AI bot traffic into a revenue stream while protecting their valuable content.
                        </p>
                        <Link
                            to="/auth"
                            className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 sm:w-auto transition duration-300"
                        >
                            Sign up for free
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;