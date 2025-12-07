import React, { useMemo } from 'react'
import { Helmet } from 'react-helmet-async'
import { useCompanyInfo } from '@/hooks/useCompanyInfo'

const About: React.FC = () => {
  const { companyInfo } = useCompanyInfo()
  const companyName = companyInfo?.company_name || '西安超群粮油贸易有限公司'
  const companyIntro = companyInfo?.introduction || companyInfo?.short_description || '西安超群粮油贸易有限公司是一家专业的粮油批发服务商，拥有强大的仓储、配送和服务能力'
  const bannerImage = companyInfo?.banner_image

  // 发展历程数据
  const timeline = [
    {
      year: '2010',
      title: '公司成立',
      description: '西安超群粮油贸易有限公司正式成立，开始从事粮油批发业务'
    },
    {
      year: '2013',
      title: '扩大规模',
      description: '建立了1000平方米的仓储设施，扩大了业务规模'
    },
    {
      year: '2016',
      title: '完善配送',
      description: '组建了专业的配送团队，提供上门配送服务'
    },
    {
      year: '2019',
      title: '现代化仓储',
      description: '建成了5000平方米的现代化仓储设施，采用先进的仓储管理系统'
    },
    {
      year: '2022',
      title: '服务升级',
      description: '实现了当日/次日发货服务，覆盖西安及周边地区'
    },
    {
      year: '2024',
      title: '数字化转型',
      description: '开始数字化转型，建立了线上订单系统，提升服务效率'
    }
  ]

  // 企业文化数据
  const culture = [
    {
      title: '使命',
      description: '为客户提供优质、安全、高效的粮油供应服务，助力客户事业发展'
    },
    {
      title: '愿景',
      description: '成为西安地区最具影响力的粮油批发服务商，引领行业发展'
    },
    {
      title: '价值观',
      description: '诚信为本，质量第一，客户至上，合作共赢'
    }
  ]

  // 服务渠道数据
  const channels = useMemo(() => {
    if (companyInfo?.service_channels) return companyInfo.service_channels.split(/[，,]/).filter(Boolean)
    return ['高校', '团餐公司', '社会餐饮', '商超', '食品厂', '社区团购平台', '线上平台']
  }, [companyInfo])

  return (
    <div className="py-12">
      <Helmet>
        <title>关于我们 - {companyName}</title>
        <meta name="description" content={companyInfo?.seo_description || companyIntro} />
      </Helmet>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* 公司简介 */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h1 className="section-title">关于我们</h1>
            <p className="section-subtitle">{companyIntro}</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold">公司简介</h2>
                <p className="text-gray-600 leading-relaxed">
                  {companyInfo?.description || companyIntro}
                </p>
              </div>
              <div className="bg-light rounded-lg p-6 flex items-center justify-center">
                {bannerImage
                  ? <img src={bannerImage} alt="公司形象" className="max-h-80 object-contain" />
                  : <span className="text-gray-400 text-xl">公司形象图片</span>}
              </div>
            </div>
          </div>
        </section>

        {/* 发展历程 */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="section-title">发展历程</h2>
            <p className="section-subtitle">公司自2010年成立以来，不断发展壮大，逐步成为西安地区具有影响力的粮油批发服务商</p>
          </div>

          <div className="relative">
            {/* 时间轴连接线 */}
            <div className="hidden md:block absolute top-0 bottom-0 left-1/2 w-1 bg-gray-200 -translate-x-1/2 z-0"></div>
            
            {/* 时间轴内容 */}
            <div className="space-y-12 relative z-10">
              {timeline.map((item, index) => (
                <div key={index} className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-8 items-center`}>
                  {/* 左侧内容 */}
                  <div className={`w-full md:w-1/2 ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                      <p className="text-gray-600">{item.description}</p>
                    </div>
                  </div>
                  
                  {/* 中间时间点 */}
                  <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center z-10">
                    <span className="font-bold">{item.year}</span>
                  </div>
                  
                  {/* 右侧空内容 */}
                  <div className="w-full md:w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 企业文化 */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="section-title">企业文化</h2>
            <p className="section-subtitle">我们始终坚持"诚信为本，质量第一，客户至上，合作共赢"的价值观</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {culture.map((item, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-8 text-center transition-all duration-300 hover:shadow-lg card-hover">
                <div className="text-3xl font-bold text-primary mb-4">{item.title}</div>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 服务渠道 */}
        <section>
          <div className="text-center mb-12">
            <h2 className="section-title">服务渠道</h2>
            <p className="section-subtitle">我们为多种类型的客户提供专业的粮油批发服务</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
              {channels.map((channel, index) => (
                <div key={index} className="bg-light rounded-lg p-4 text-center transition-all duration-300 hover:bg-primary/10 hover:text-primary">
                  <p className="font-medium">{channel}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default About
