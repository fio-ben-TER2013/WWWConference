<?php 
namespace fibe\Bundle\WWWConfBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
//On insere l'entity Event  de simple schedule
use IDCI\Bundle\SimpleScheduleBundle\Form\XPropertyType; 
use IDCI\Bundle\SimpleScheduleBundle\Form\EventType;
use IDCI\Bundle\SimpleScheduleBundle\Entity\XProperty; 
use IDCI\Bundle\SimpleScheduleBundle\Entity\Event; 
//use fibe\Bundle\WWWConfBundle\Form\EventType; 
//On insere le controlleur de Event 
//use SimpleScheduleBundle\Controller
/**
 * Link controller.
 *
 * @Route("/admin/link")
 */
class LinkController extends Controller
{
/**
 * @Route("/", name="wwwconf_link_index")
 * @Template()
 */
    public function indexAction()
    {
        return array();
    }
    
/**
 * @Route("/create", name="wwwconf_link_create")
 * @Template()
 */
    public function createAction()
    {
		 
  $event = new Event(); 
  $formEvent = $this->createForm(new EventType(), $event);
  
  $xproperty = new XProperty();
  $xproperty->setXNamespace('publication_uri');
  $xproperty->setXKey(rand (0,9999999999));//todo AUTO_INCREMENT ??  
  $formXProperty = $this->createForm(new XPropertyType(), $xproperty);
  
  // On passe la méthode createView() du formulaire à la vue afin qu'elle puisse afficher le formulaire toute seule
      return  array(
        'formEvent'     => $formEvent->createView(),
        'formXProperty' => $formXProperty->createView()
      );
	
    }
    
/**
 * @Route("/list", name="wwwconf_link_list")
 * @Template( )
 */
    public function listAction()
    {
	    $em = $this->getDoctrine()->getManager();
        $entities = $em->getRepository('IDCISimpleScheduleBundle:XProperty')->findAll(); 
        
        return array(
            'xproperties' => $entities,
        );
		//Recuperer tous le evenements et les afficher
        return array();
    }
    
    
}
